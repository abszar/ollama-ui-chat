import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import ModelSelector from './components/ModelSelector';
import WindowControls from './components/WindowControls';
import ConfigDialog from './components/ConfigDialog';
import { storageService } from './services/storageService';
import { configService } from './services/configService';
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
  const [configOpen, setConfigOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(configService.getBaseUrl());

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

  const handleSaveConfig = (newBaseUrl: string) => {
    configService.setBaseUrl(newBaseUrl);
    setBaseUrl(newBaseUrl);
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
            px: 2,
            justifyContent: 'space-between'
          }}
        >
          <IconButton
            size="small"
            onClick={() => setConfigOpen(true)}
            sx={{
              WebkitAppRegion: 'no-drag',
              padding: '4px',
              '& svg': { fontSize: '1.2rem' }
            }}
          >
            <SettingsIcon />
          </IconButton>
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

      <ConfigDialog
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        currentBaseUrl={baseUrl}
        onSave={handleSaveConfig}
      />
    </ThemeProvider>
  );
}

export default App;
