import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  Select,
  MenuItem,
  Theme,
} from '@mui/material';
import { getAvailableModels } from '../services/ollamaService';
import { MessageInput } from './chat/MessageInput';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import SchoolIcon from '@mui/icons-material/School';

const suggestions = [
  {
    title: "Code Examples",
    icon: <CodeIcon />,
    prompt: "Create a React component with TypeScript and explain each part"
  },
  {
    title: "General Knowledge",
    icon: <SchoolIcon />,
    prompt: "Explain the theory of relativity in simple terms"
  },
  {
    title: "Creative Writing",
    icon: <ChatIcon />,
    prompt: "Write a short story about a time traveler in the modern world"
  }
];

interface HomePageProps {
  onStartChat: (model: string, initialMessage?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartChat }) => {
  const theme = useTheme();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await getAvailableModels();
        setModels(availableModels.map(m => m.name));
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0].name);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();
  }, []);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleStartChat = () => {
    if (selectedModel && input.trim()) {
      onStartChat(selectedModel, input);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleStartChat();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        px: 4,
        position: 'relative',
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
          pointerEvents: "none",
          backgroundImage: (theme: Theme) => `
            radial-gradient(circle at 1px 1px, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)
          `,
          backgroundSize: "16px 16px",
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          maxWidth: 900,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 600 }}>
          Ollama Chat
        </Typography>

        <Box sx={{ width: '100%' }}>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            size="small"
            sx={{
              mb: 2,
              width: 200,
              backgroundColor: theme.palette.background.paper,
              '& .MuiSelect-select': {
                py: 1,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              }
            }}
          >
            {models.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>

          <Box
            sx={{
              width: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: 3,
            }}
          >
            <MessageInput
              input={input}
              setInput={setInput}
              selectedImage={selectedImage}
              isLoading={false}
              isModelMultimodal={false}
              onSend={handleStartChat}
              onStop={() => {}}
              onImageSelect={() => {}}
              onImageRemove={() => setSelectedImage(null)}
              onKeyPress={handleKeyPress}
            />
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          width: '100%',
          justifyContent: 'center',
        }}>
          {suggestions.map((category) => (
            <Button
              key={category.title}
              onClick={() => handlePromptClick(category.prompt)}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 4,
                textTransform: 'none',
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              {React.cloneElement(category.icon as React.ReactElement, { 
                sx: { 
                  fontSize: '1.2rem',
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                } 
              })}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {category.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textAlign: 'left',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {category.prompt}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
