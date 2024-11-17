import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Container, Alert, Snackbar, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import { streamResponse, generateTitle } from '../services/ollamaService';
import { storageService } from '../services/storageService';
import CodeBlock from './CodeBlock';
import LoadingDots from './LoadingDots';

interface ChatProps {
    sessionId: number;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [model, setModel] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadChat = () => {
            try {
                const chatMessages = storageService.getChatMessages(sessionId);
                const chatModel = storageService.getChatModel(sessionId);
                setMessages(chatMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })));
                setModel(chatModel);
            } catch (error) {
                console.error('Error loading chat:', error);
                setError('Failed to load messages');
            }
        };

        loadChat();
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim()
        };

        const currentInput = input.trim();
        setInput('');

        try {
            setIsLoading(true);
            setError(null);

            storageService.addChatMessage(sessionId, userMessage.role, userMessage.content);

            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);

            if (messages.length === 0) {
                const title = await generateTitle(currentInput, model);
                storageService.updateChatSessionTitle(sessionId, title);
            }

            let assistantMessage: Message = {
                role: 'assistant',
                content: ''
            };

            setMessages([...updatedMessages, assistantMessage]);

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
                        backgroundColor: 'rgba(0,0,0,0.2)',
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

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#1a1a1a'
        }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                px: 3,
                py: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255,255,255,0.02)'
            }}>
                <SmartToyIcon sx={{ color: '#666' }} />
                <Typography variant="subtitle2" sx={{ 
                    color: '#888',
                    fontSize: '0.85rem',
                    fontWeight: 500
                }}>
                    {model}
                </Typography>
            </Box>
            
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
                        background: '#444',
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
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
                                backgroundColor: message.role === 'user' ? '#333333' : '#222',
                                color: message.role === 'user' ? '#e0e0e0' : '#d4d4d4',
                                borderRadius: '12px',
                                px: message.role === 'user' ? 2 : 2.5,
                                py: message.role === 'user' ? 1.5 : 2,
                                boxShadow: message.role === 'user' ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
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
                                backgroundColor: '#222',
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
            
            <Box sx={{ 
                p: 2,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#1d1d1d'
            }}>
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1,
                    maxWidth: '900px',
                    margin: '0 auto',
                    width: '100%',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#2f2f2f',
                    },
                    '&:focus-within': {
                        backgroundColor: '#333',
                        boxShadow: '0 0 0 2px rgba(66, 153, 225, 0.3)',
                    }
                }}>
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
                                color: '#e0e0e0',
                                padding: '4px 0',
                                '&::placeholder': {
                                    color: '#666',
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                    <IconButton 
                        color="primary" 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
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
                                backgroundColor: 'rgba(255,255,255,0.1)',
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
