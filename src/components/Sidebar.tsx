import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    IconButton,
    Button,
    Typography,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    ChatBubbleOutline as ChatIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { databaseService } from '../services/databaseService';
import type { ChatSession } from '../types/database';

interface SidebarProps {
    selectedChat: number | null;
    onSelectChat: (chatId: number) => void;
    onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedChat, onSelectChat, onNewChat }) => {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    const loadChatSessions = async () => {
        try {
            const sessions = await databaseService.getChatSessions();
            setChatSessions(sessions.map(session => ({
                ...session,
                title: session.title.replace(/^["']|["']$/g, '') // Remove quotes from title
            })));
        } catch (error) {
            console.error('Error loading chat sessions:', error);
        }
    };

    // Poll for updates every 2 seconds
    useEffect(() => {
        loadChatSessions();
        const interval = setInterval(loadChatSessions, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleNewChat = () => {
        onNewChat();
        loadChatSessions();
    };

    const handleDeleteChat = async (sessionId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await databaseService.deleteChatSession(sessionId);
            await loadChatSessions();
            if (selectedChat === sessionId) {
                onSelectChat(0);
            }
        } catch (error) {
            console.error('Error deleting chat session:', error);
        }
    };

    const handleEditClick = (session: ChatSession, event: React.MouseEvent) => {
        event.stopPropagation();
        setEditingSession(session);
        setNewTitle(session.title);
        setDialogOpen(true);
    };

    const handleEditSave = async () => {
        if (editingSession && newTitle.trim()) {
            try {
                await databaseService.updateChatSessionTitle(editingSession.id, newTitle.trim());
                await loadChatSessions();
                setDialogOpen(false);
                setEditingSession(null);
                setNewTitle('');
            } catch (error) {
                console.error('Error updating chat title:', error);
            }
        }
    };

    return (
        <Box
            sx={{
                width: 250,
                backgroundColor: '#1a1a1a',
                borderRight: '1px solid #333',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ p: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={handleNewChat}
                    sx={{
                        backgroundColor: '#2d2d2d',
                        '&:hover': {
                            backgroundColor: '#3d3d3d'
                        }
                    }}
                >
                    New Chat
                </Button>
            </Box>

            <List sx={{ flex: 1, overflowY: 'auto' }}>
                {chatSessions.map((session) => (
                    <ListItem
                        key={session.id}
                        disablePadding
                        secondaryAction={
                            <Box>
                                <Tooltip title="Edit title">
                                    <IconButton
                                        edge="end"
                                        onClick={(e) => handleEditClick(session, e)}
                                        sx={{ color: '#888' }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete chat">
                                    <IconButton
                                        edge="end"
                                        onClick={(e) => handleDeleteChat(session.id, e)}
                                        sx={{ color: '#888' }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                    >
                        <ListItemButton
                            selected={selectedChat === session.id}
                            onClick={() => onSelectChat(session.id)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: '#2d2d2d',
                                    '&:hover': {
                                        backgroundColor: '#3d3d3d'
                                    }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: '#888' }}>
                                <ChatIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        noWrap
                                        sx={{
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {session.title}
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Edit Chat Title</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Chat Title"
                        type="text"
                        fullWidth
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sidebar;
