import React, { useState, useEffect } from "react";
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
  TextField,
  Chip,
  Divider,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  SmartToy as ModelIcon,
} from "@mui/icons-material";
import { storageService } from "../services/storageService";

interface ChatSession {
  id: number;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  selectedChat: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedChat,
  onSelectChat,
  onNewChat,
}) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadChatSessions = () => {
    try {
      const sessions = storageService.getChatSessions();
      setChatSessions(
        sessions.map((session) => ({
          ...session,
          title: session.title.replace(/^["']|["']$/g, ""),
        }))
      );
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

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
      storageService.deleteChatSession(sessionId);
      loadChatSessions();
      if (selectedChat === sessionId) {
        onSelectChat(0);
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  const handleEditClick = (session: ChatSession, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingSession(session);
    setNewTitle(session.title);
    setDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingSession && newTitle.trim()) {
      try {
        storageService.updateChatSessionTitle(editingSession.id, newTitle.trim());
        loadChatSessions();
        setDialogOpen(false);
        setEditingSession(null);
        setNewTitle("");
      } catch (error) {
        console.error("Error updating chat title:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: "#1a1a1a",
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid #333',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{
            backgroundColor: "#2d2d2d",
            boxShadow: 'none',
            height: '44px',
            fontSize: '0.95rem',
            textTransform: 'none',
            "&:hover": {
              backgroundColor: "#3d3d3d",
              boxShadow: 'none',
            },
          }}
        >
          New Chat
        </Button>
      </Box>

      <Divider sx={{ borderColor: '#333' }} />

      <List sx={{ 
        flex: 1, 
        overflowY: "auto",
        py: 0,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1a1a1a',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#444',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        {chatSessions.map((session) => (
          <ListItem
            key={session.id}
            disablePadding
            sx={{
              borderBottom: '1px solid #2a2a2a',
            }}
          >
            <ListItemButton
              selected={selectedChat === session.id}
              onClick={() => onSelectChat(session.id)}
              sx={{
                py: 1.5,
                px: 2,
                "&.Mui-selected": {
                  backgroundColor: "#2d2d2d",
                  "&:hover": {
                    backgroundColor: "#3d3d3d",
                  },
                },
                "&:hover": {
                  backgroundColor: "#252525",
                  "& .action-buttons": {
                    opacity: 1,
                  },
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ChatIcon sx={{ color: '#888', fontSize: '1.2rem', mr: 1 }} />
                  <Typography
                    noWrap
                    sx={{
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    {session.title}
                  </Typography>
                  <Box 
                    className="action-buttons"
                    sx={{ 
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      gap: 0.5
                    }}
                  >
                    <Tooltip title="Edit title">
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditClick(session, e)}
                        sx={{ 
                          color: "#888",
                          padding: '4px',
                          '&:hover': { color: '#fff', backgroundColor: '#444' }
                        }}
                      >
                        <EditIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete chat">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        sx={{ 
                          color: "#888",
                          padding: '4px',
                          '&:hover': { color: '#ff4444', backgroundColor: '#442222' }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip
                    icon={<ModelIcon sx={{ fontSize: "0.75rem !important" }} />}
                    label={session.model}
                    size="small"
                    sx={{
                      height: "22px",
                      backgroundColor: '#2d2d2d',
                      border: '1px solid #444',
                      color: '#888',
                      "& .MuiChip-label": {
                        fontSize: "0.7rem",
                        px: 1,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontSize: '0.7rem',
                    }}
                  >
                    {formatDate(session.updated_at)}
                  </Typography>
                </Box>
              </Box>
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
