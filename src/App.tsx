import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { CodeSidebar } from './components/CodeSidebar';
import ConfigDialog from './components/ConfigDialog';
import { configService } from './services/configService';
import WindowControls from './components/WindowControls';
import { useCodeSidebarStore } from './store/codeSidebarStore';
import { HomePage } from './components/HomePage';
import { storageService } from './services/storageService';
import { streamResponse } from './services/ollamaService';

function App() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
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

  const handleStartChat = async (model: string, initialMessage?: string) => {
    try {
      const newSession = storageService.createChatSession('New Chat', model);
      // Set selected chat immediately
      setSelectedChat(newSession.id);
      
      if (initialMessage) {
        // Add user message
        storageService.addChatMessage(newSession.id, 'user', initialMessage);

        // Generate title based on initial message
        const title = initialMessage.length > 50 
          ? initialMessage.substring(0, 50) + '...'
          : initialMessage;
        storageService.updateChatSessionTitle(newSession.id, title);

        // Add and stream assistant response
        let assistantMessage = '';
        await streamResponse(
          [{ role: 'user', content: initialMessage }],
          model,
          (chunk) => {
            assistantMessage += chunk;
          },
          async () => {
            storageService.addChatMessage(newSession.id, 'assistant', assistantMessage);
          }
        );
      }
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
            onNewChat={() => setSelectedChat(null)}
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
              <HomePage onStartChat={handleStartChat} />
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
