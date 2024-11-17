import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import ModelSelector from './components/ModelSelector';
import WindowControls from './components/WindowControls';
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
      resetContext();
      const newSession = storageService.createChatSession('New Chat', model);
      setSelectedChat(newSession.id);
      setModelSelectorOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectChat = (chatId: number) => {
    resetContext();
    setSelectedChat(chatId);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        overflow: 'hidden',
        backgroundColor: 'background.default'
      }}>
        {/* Titlebar */}
        <Box
          sx={{
            height: '32px',
            minHeight: '32px',
            backgroundColor: 'background.paper',
            WebkitAppRegion: 'drag',
            position: 'relative',
            zIndex: 100,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            px: 2
          }}
        >
          <WindowControls />
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Sidebar */}
          <Box sx={{ 
            display: 'flex',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'background.paper',
          }}>
            <Sidebar
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
            />
          </Box>

          {/* Chat Area */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'background.default',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {selectedChat !== null && (
              <Chat
                key={selectedChat}
                sessionId={selectedChat}
              />
            )}
          </Box>
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
