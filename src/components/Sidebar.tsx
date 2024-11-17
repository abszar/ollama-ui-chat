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

  return (
    <Box
      sx={{
        width: 250,
        backgroundColor: "#1a1a1a",
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
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
            "&:hover": {
              backgroundColor: "#3d3d3d",
            },
          }}
        >
          New Chat
        </Button>
      </Box>

      <List sx={{ 
        flex: 1, 
        overflowY: "auto",
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1a1a1a',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#333',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#444',
        },
      }}>
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
                    sx={{ color: "#888" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete chat">
                  <IconButton
                    edge="end"
                    onClick={(e) => handleDeleteChat(session.id, e)}
                    sx={{ color: "#888" }}
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
                "&.Mui-selected": {
                  backgroundColor: "#2d2d2d",
                  "&:hover": {
                    backgroundColor: "#3d3d3d",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: "#888" }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box>
                    <Typography
                      noWrap
                      sx={{
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {session.title}
                    </Typography>
                    <Chip
                      icon={<ModelIcon sx={{ fontSize: "0.75rem !important" }} />}
                      label={session.model}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: "20px",
                        "& .MuiChip-label": {
                          fontSize: "0.65rem",
                          px: 1,
                        },
                      }}
                    />
                  </Box>
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
