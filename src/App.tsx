import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import ModelSelector from './components/ModelSelector';
import { storageService } from './services/storageService';
import { resetContext } from './services/ollamaService';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  },
});

function App() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  useEffect(() => {
    // Load the most recent chat session or prepare to create a new one
    const initializeChat = () => {
      try {
        const sessions = storageService.getChatSessions();
        if (sessions.length > 0) {
          setSelectedChat(sessions[0].id);
        } else {
          handleNewChat();
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, []);

  const handleNewChat = () => {
    setModelSelectorOpen(true);
  };

  const handleModelSelect = (model: string) => {
    try {
      // Reset context for new chat
      resetContext();
      const newSession = storageService.createChatSession('New Chat', model);
      setSelectedChat(newSession.id);
      setModelSelectorOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectChat = (chatId: number) => {
    // Reset context when switching chats
    resetContext();
    setSelectedChat(chatId);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChat !== null && (
            <Chat
              key={selectedChat}
              sessionId={selectedChat}
            />
          )}
        </Box>
      </Box>
      <ModelSelector
        open={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        onModelSelect={handleModelSelect}
      />
    </ThemeProvider>
  );
}

export default App;
