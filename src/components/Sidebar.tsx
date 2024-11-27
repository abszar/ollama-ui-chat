import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  SmartToy as ModelIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { BurgerMenuIcon } from "./BurgerMenuIcon";
import { storageService } from "../services/storageService";
import { useResizable } from "../hooks/useResizable";
import { checkOllamaStatus, getAvailableModels } from "../services/ollamaService";
import { ModelInstaller } from "./ModelInstaller";

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
  onOpenConfig: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedChat,
  onSelectChat,
  onNewChat,
  onOpenConfig,
}) => {
  const theme = useTheme();
  const { width, isResizing, startResizing } = useResizable();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isOllamaOffline, setIsOllamaOffline] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [installerOpen, setInstallerOpen] = useState(false);

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

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkOllamaStatus();
      setIsOllamaOffline(!status.isAvailable);
      
      if (status.isAvailable) {
        try {
          const models = await getAvailableModels();
          setAvailableModels(models.map(m => m.name));
        } catch (error) {
          console.error("Error fetching models:", error);
          setAvailableModels([]);
        }
      } else {
        setAvailableModels([]);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const handleInstallComplete = async () => {
    setInstallerOpen(false);
    const status = await checkOllamaStatus();
    if (status.isAvailable) {
      const models = await getAvailableModels();
      setAvailableModels(models.map(m => m.name));
    }
  };

  const isModelUnavailable = (model: string) => {
    return isOllamaOffline || !availableModels.includes(model);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? '48px' : width,
        backgroundColor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        userSelect: isResizing ? 'none' : 'auto',
        transition: 'width 0.2s ease',
      }}
    >
      {!isCollapsed && (
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={() => setInstallerOpen(true)}
              sx={{
                height: '36px',
                fontSize: '0.9rem',
                textTransform: 'none',
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              Manage Modules
            </Button>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                variant="outlined"
                onClick={onOpenConfig}
                sx={{
                  height: '36px',
                  minWidth: '36px',
                  width: '36px',
                  padding: 0,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <SettingsIcon sx={{ fontSize: '1.2rem' }} />
              </Button>
              <IconButton
                onClick={toggleCollapse}
                sx={{
                  height: '36px',
                  width: '36px',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <BurgerMenuIcon />
              </IconButton>
            </Box>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={onNewChat}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f0f0f0',
              color: theme.palette.text.primary,
              boxShadow: 'none',
              height: '36px',
              fontSize: '0.9rem',
              textTransform: 'none',
              "&:hover": {
                backgroundColor: theme.palette.mode === 'dark' ? '#3d3d3d' : '#e0e0e0',
                boxShadow: 'none',
              },
            }}
          >
            New Chat
          </Button>
        </Box>
      )}

      {isCollapsed && (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <IconButton
            onClick={toggleCollapse}
            sx={{
              width: '32px',
              height: '32px',
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            <BurgerMenuIcon />
          </IconButton>
          <Tooltip title="New Chat" placement="right">
            <IconButton
              onClick={onNewChat}
              sx={{
                width: '32px',
                height: '32px',
                color: theme.palette.text.primary,
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <List sx={{ 
        flex: 1, 
        overflowY: "auto",
        py: 0,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.background.paper,
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' ? '#444' : '#ccc',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.mode === 'dark' ? '#555' : '#bbb',
        },
      }}>
        {chatSessions.map((session) => (
          <ListItem
            key={session.id}
            disablePadding
          >
            <ListItemButton
              selected={selectedChat === session.id}
              onClick={() => onSelectChat(session.id)}
              sx={{
                py: 0.75,
                px: 1.5,
                minHeight: '36px',
                "&.Mui-selected": {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                  "&:hover": {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.08)',
                  },
                },
                "&:hover": {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  "& .action-buttons": {
                    opacity: 1,
                  },
                },
              }}
            >
              {isCollapsed ? (
                <ChatIcon sx={{ 
                  fontSize: '1.2rem',
                  color: theme.palette.text.secondary,
                  opacity: 0.7
                }} />
              ) : (
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  <ChatIcon sx={{ 
                    color: theme.palette.text.secondary, 
                    fontSize: '1rem',
                    mr: 1,
                    opacity: 0.7
                  }} />
                  {isModelUnavailable(session.model) && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#ff4444",
                        mr: 1,
                      }}
                    />
                  )}
                  <Typography
                    noWrap
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: "0.85rem",
                      fontWeight: 400,
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
                      gap: 0.5,
                      ml: 1,
                      alignItems: 'center'
                    }}
                  >
                    <Tooltip title={`Model: ${session.model}`}>
                      <ModelIcon sx={{ 
                        fontSize: '0.9rem',
                        color: theme.palette.text.secondary,
                        opacity: 0.7
                      }} />
                    </Tooltip>
                    <Tooltip title="Edit title">
                      <IconButton
                        size="small"
                        onClick={(e) => handleEditClick(session, e)}
                        sx={{ 
                          color: theme.palette.text.secondary,
                          padding: '2px',
                          '&:hover': { 
                            color: theme.palette.text.primary,
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <EditIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete chat">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        sx={{ 
                          color: theme.palette.text.secondary,
                          padding: '2px',
                          '&:hover': { 
                            color: theme.palette.error.main,
                            backgroundColor: theme.palette.error.main + '1A'
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {!isCollapsed && (
        <Box
          onMouseDown={startResizing}
          sx={{
            position: 'absolute',
            top: 0,
            right: -4,
            bottom: 0,
            width: 8,
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              '.resize-handle': {
                opacity: 0.5,
              },
            },
            '&:active': {
              '.resize-handle': {
                opacity: 1,
              },
            },
          }}
        >
          <Box
            className="resize-handle"
            sx={{
              width: 2,
              height: '100%',
              backgroundColor: theme.palette.divider,
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
          />
        </Box>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
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
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={installerOpen}
        onClose={() => setInstallerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogContent>
          <ModelInstaller onComplete={handleInstallComplete} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
