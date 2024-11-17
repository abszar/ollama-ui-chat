import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Container, Alert, Snackbar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import { streamResponse, generateTitle, resetContext } from '../services/ollamaService';
import { databaseService } from '../services/databaseService';
import CodeBlock from './CodeBlock';

interface ChatProps {
    sessionId: number;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Reset context when switching chats
        resetContext();
        
        // Load messages for this session
        const loadMessages = async () => {
            try {
                const chatMessages = await databaseService.getChatMessages(sessionId);
                setMessages(chatMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })));
            } catch (error) {
                console.error('Error loading messages:', error);
                setError('Failed to load messages');
            }
        };

        loadMessages();
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

        try {
            // Save user message to database
            await databaseService.addChatMessage(sessionId, userMessage.role, userMessage.content);

            // Update messages state with user message
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);

            // Generate title if this is the first message
            if (messages.length === 0) {
                const title = await generateTitle(userMessage.content);
                await databaseService.updateChatSessionTitle(sessionId, title);
            }

            setInput('');
            setIsLoading(true);
            setError(null);

            let assistantMessage: Message = {
                role: 'assistant',
                content: ''
            };

            // Add empty assistant message to show typing indicator
            setMessages([...updatedMessages, assistantMessage]);

            // Pass all messages to maintain conversation context
            await streamResponse(
                updatedMessages,
                (chunk) => {
                    assistantMessage.content += chunk;
                    setMessages([...updatedMessages, { ...assistantMessage }]);
                },
                async () => {
                    // Save complete assistant message to database
                    await databaseService.addChatMessage(sessionId, assistantMessage.role, assistantMessage.content);
                    setIsLoading(false);
                }
            );
        } catch (error: any) {
            console.error('Error generating response:', error);
            setIsLoading(false);
            setError(error.message || 'Failed to generate response. Please try again.');
            setMessages(messages); // Revert to previous messages state
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
                        backgroundColor: 'rgba(0,0,0,0.3)',
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
                <p style={{ margin: '0.5em 0', lineHeight: '1.5' }}>
                    {children}
                </p>
            );
        },
        pre({ children }: any) {
            return <>{children}</>;
        }
    };

    return (
        <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    flex: 1, 
                    mb: 2, 
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper'
                }}
            >
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            mb: 2,
                            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            width: message.role === 'assistant' ? '85%' : 'auto'
                        }}
                    >
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                backgroundColor: message.role === 'user' ? 'primary.main' : '#2A2A2A',
                                color: message.role === 'user' ? 'white' : '#E0E0E0',
                                width: '100%'
                            }}
                        >
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </Paper>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
                    disabled={isLoading}
                    sx={{ 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            color: 'text.primary'
                        }
                    }}
                />
                <IconButton 
                    color="primary" 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                >
                    <SendIcon />
                </IconButton>
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
        </Container>
    );
};

export default Chat;
