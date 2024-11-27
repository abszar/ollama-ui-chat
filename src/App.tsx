import React, { useState } from 'react';
import { Box, CssBaseline, Typography, ThemeProvider, createTheme, Dialog, DialogContent } from '@mui/material';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { CodeSidebar } from './components/CodeSidebar';
import ConfigDialog from './components/ConfigDialog';
import { configService } from './services/configService';
import WindowControls from './components/WindowControls';
import { useCodeSidebarStore } from './store/codeSidebarStore';
import { ModelInstaller } from './components/ModelInstaller';
import { storageService } from './services/storageService';

function App() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [modelSelectOpen, setModelSelectOpen] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const isCodeSidebarOpen = useCodeSidebarStore(state => state.isOpen);

  const customTheme = createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        paper: mode === 'dark' ? '#242424' : '#ffffff',
      },
    },
  });

  const handleSelectChat = (chatId: number) => {
    setSelectedChat(chatId);
  };

  const handleNewChat = () => {
    setModelSelectOpen(true);
  };

  const handleModelSelect = (model: string) => {
    try {
      const newSession = storageService.createChatSession('New Chat', model);
      setSelectedChat(newSession.id);
      setModelSelectOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleConfigSave = (baseUrl: string, newTheme: 'light' | 'dark') => {
    configService.setBaseUrl(baseUrl);
    if (newTheme !== mode) {
      setMode(newTheme);
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Box
          className="titlebar"
          sx={{
            height: '32px',
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f0f0f0',
            WebkitAppRegion: 'drag',
            position: 'relative',
            zIndex: 1000,
            borderBottom: `1px solid ${customTheme.palette.divider}`,
          }}
        >
          <WindowControls />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden',
          transition: 'margin-right 0.2s ease',
        }}>
          <Sidebar
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onOpenConfig={() => setConfigOpen(true)}
          />
          <Box
            component="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              backgroundColor: customTheme.palette.background.default,
              transition: 'margin-right 0.2s ease',
            }}
          >
            {selectedChat ? (
              <Chat sessionId={selectedChat} />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" gutterBottom>
                  Welcome to Ollama Chat
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start a new chat or select an existing conversation to begin
                </Typography>
              </Box>
            )}
          </Box>
          <CodeSidebar />
        </Box>
        <ConfigDialog
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          currentBaseUrl={configService.getBaseUrl()}
          currentTheme={mode}
          onSave={handleConfigSave}
        />
        <Dialog
          open={modelSelectOpen}
          onClose={() => setModelSelectOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: customTheme.palette.background.paper,
            }
          }}
        >
          <DialogContent>
            <ModelInstaller 
              mode="select"
              onComplete={() => setModelSelectOpen(false)}
              onModelSelect={handleModelSelect}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
