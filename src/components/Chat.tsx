import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Alert, Snackbar, Typography, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import { streamResponse, generateTitle, checkOllamaStatus, isModelMultimodal } from '../services/ollamaService';
import { storageService } from '../services/storageService';
import CodeBlock from './CodeBlock';
import LoadingDots from './LoadingDots';
import InstallInstructions from './InstallInstructions';

interface ChatProps {
    sessionId: number;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
    const theme = useTheme();
    
    // State management
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [model, setModel] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [ollamaStatus, setOllamaStatus] = useState<{ isAvailable: boolean; hasModels: boolean }>({
        isAvailable: false,
        hasModels: false
    });
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check Ollama status on mount
    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkOllamaStatus();
            setOllamaStatus(status);
        };
        checkStatus();
    }, []);

    // Load chat messages when session changes
    useEffect(() => {
        const loadChat = () => {
            try {
                const chatMessages = storageService.getChatMessages(sessionId);
                const chatModel = storageService.getChatModel(sessionId);
                setMessages(chatMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    image: msg.image
                })));
                setModel(chatModel);
            } catch (error) {
                console.error('Error loading chat:', error);
                setError('Failed to load messages');
            }
        };

        if (ollamaStatus.isAvailable && ollamaStatus.hasModels) {
            loadChat();
        }
    }, [sessionId, ollamaStatus]);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    setSelectedImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error reading file:', error);
                setError('Failed to read image file');
            }
        }
    };

    const handleImageRemove = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        if (selectedImage && !isModelMultimodal(model)) {
            setError('Current model does not support image input. Please use llava or bakllava models for image analysis.');
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            image: selectedImage || undefined
        };

        const currentInput = input.trim();
        setInput('');
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        try {
            setIsLoading(true);
            setError(null);

            // Save user message
            storageService.addChatMessage(sessionId, userMessage.role, userMessage.content, userMessage.image);
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);

            // Generate title for new chats
            if (messages.length === 0) {
                const title = await generateTitle(currentInput, model);
                storageService.updateChatSessionTitle(sessionId, title);
            }

            // Prepare for assistant response
            let assistantMessage: Message = {
                role: 'assistant',
                content: ''
            };

            setMessages([...updatedMessages, assistantMessage]);

            // Stream the response
            await streamResponse(
                updatedMessages,
                model,
                (chunk) => {
                    assistantMessage.content += chunk;
                    setMessages([...updatedMessages, { ...assistantMessage }]);
                },
                async () => {
                    storageService.addChatMessage(sessionId, assistantMessage.role, assistantMessage.content);
                    setIsLoading(false);
                }
            );
        } catch (error: any) {
            console.error('Error generating response:', error);
            setIsLoading(false);
            setError(error.message || 'Failed to generate response. Please try again.');
            setMessages(messages);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    // Custom components for markdown rendering
    const MarkdownComponents = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
                return (
                    <CodeBlock
                        code={String(children).replace(/\n$/, '')}
                        language={language}
                    />
                );
            }
            
            return (
                <code 
                    className={className} 
                    {...props}
                    style={{
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
                    }}
                >
                    {children}
                </code>
            );
        },
        p({ children }: any) {
            return (
                <p style={{ margin: '0.5em 0', lineHeight: '1.6' }}>
                    {children}
                </p>
            );
        },
        pre({ children }: any) {
            return <>{children}</>;
        }
    };

    // Render installation instructions if Ollama is not available
    if (!ollamaStatus.isAvailable) {
        return (
            <Box sx={{ 
                height: '100%',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <InstallInstructions type="no-ollama" />
            </Box>
        );
    }

    if (!ollamaStatus.hasModels) {
        return (
            <Box sx={{ 
                height: '100%',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <InstallInstructions type="no-models" />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default'
        }}>
            {/* Model Info Header */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                px: 3,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backdropFilter: 'blur(10px)',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
            }}>
                <SmartToyIcon sx={{ color: theme.palette.text.disabled }} />
                <Typography variant="subtitle2" sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.85rem',
                    fontWeight: 500
                }}>
                    {model}
                </Typography>
            </Box>
            
            {/* Messages Area */}
            <Box 
                sx={{ 
                    flex: 1, 
                    overflow: 'auto',
                    px: 3,
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'dark' ? '#444' : '#ccc',
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: theme.palette.mode === 'dark' ? '#555' : '#bbb',
                    },
                }}
            >
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: message.role === 'user' ? '60%' : '75%',
                                backgroundColor: message.role === 'user' 
                                    ? theme.palette.mode === 'dark' ? '#333333' : '#e3f2fd'
                                    : theme.palette.mode === 'dark' ? '#222' : '#f5f5f5',
                                color: theme.palette.text.primary,
                                borderRadius: '12px',
                                px: message.role === 'user' ? 2 : 2.5,
                                py: message.role === 'user' ? 1.5 : 2,
                                boxShadow: message.role === 'user' ? 'none' : theme.shadows[1],
                                '& pre': {
                                    margin: '0.5em 0',
                                },
                                '& p:first-of-type': {
                                    marginTop: 0,
                                },
                                '& p:last-of-type': {
                                    marginBottom: 0,
                                },
                            }}
                        >
                            {message.image && (
                                <Box sx={{ mb: 2 }}>
                                    <img 
                                        src={message.image} 
                                        alt="User uploaded"
                                        style={{
                                            maxWidth: '250px',
                                            maxHeight: '250px',
                                            width: 'auto',
                                            height: 'auto',
                                            borderRadius: '8px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>
                            )}
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </Box>
                    </Box>
                ))}
                {isLoading && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            maxWidth: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: theme.palette.mode === 'dark' ? '#222' : '#f5f5f5',
                                borderRadius: '12px',
                                px: 2.5,
                                py: 2,
                            }}
                        >
                            <LoadingDots />
                        </Box>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>
            
            {/* Input Area */}
            <Box sx={{ 
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' ? '#1d1d1d' : '#f8f9fa'
            }}>
                {selectedImage && (
                    <Box sx={{ 
                        maxWidth: '900px',
                        margin: '0 auto 1rem auto',
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        <img 
                            src={selectedImage} 
                            alt="Selected"
                            style={{
                                maxWidth: '150px',
                                maxHeight: '150px',
                                width: 'auto',
                                height: 'auto',
                                borderRadius: '8px',
                                border: `1px solid ${theme.palette.divider}`,
                                objectFit: 'contain'
                            }}
                        />
                        <IconButton
                            onClick={handleImageRemove}
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1,
                    maxWidth: '900px',
                    margin: '0 auto',
                    width: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff',
                    borderRadius: '16px',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#2f2f2f' : '#fafafa',
                    },
                    '&:focus-within': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
                    }
                }}>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />
                    <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || !isModelMultimodal(model)}
                        sx={{
                            color: theme.palette.primary.main,
                            '&.Mui-disabled': {
                                color: theme.palette.action.disabled,
                            }
                        }}
                    >
                        <ImageIcon />
                    </IconButton>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
                        disabled={isLoading}
                        variant="standard"
                        sx={{ 
                            flex: 1,
                            '& .MuiInputBase-root': {
                                padding: '4px 8px',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                '&:before, &:after': {
                                    display: 'none',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: theme.palette.text.primary,
                                padding: '4px 0',
                                '&::placeholder': {
                                    color: theme.palette.text.disabled,
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                    <IconButton 
                        color="primary" 
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && !selectedImage)}
                        sx={{
                            backgroundColor: 'primary.main',
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'scale(1.05)',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.1)' 
                                    : 'rgba(0,0,0,0.1)',
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.2rem',
                                color: 'white',
                                transition: 'transform 0.2s ease',
                            },
                            '&:hover .MuiSvgIcon-root': {
                                transform: 'translateX(2px)',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Error Snackbar */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setError(null)} 
                    severity="error" 
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chat;
