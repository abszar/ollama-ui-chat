import React, { useState } from 'react';
import { Box, Typography, Link, Button, keyframes } from '@mui/material';
import CodeBlock from './CodeBlock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(255, 68, 68, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
  }
`;

interface InstallInstructionsProps {
    type: 'no-ollama' | 'no-models';
}

const InstallInstructions: React.FC<InstallInstructionsProps> = ({ type }) => {
    const [showAllPlatforms, setShowAllPlatforms] = useState(false);
    const platform = navigator.platform.toLowerCase();
    const isWindows = platform.includes('win');
    const isMac = platform.includes('mac');
    const isLinux = !isWindows && !isMac;

    const getDetectedOS = () => {
        if (isWindows) return 'Windows';
        if (isMac) return 'macOS';
        return 'Linux';
    };

    if (type === 'no-models') {
        return (
            <Box sx={{
                height: '100%',
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#444',
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                },
            }}>
                <Box sx={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: 4,
                    color: '#e0e0e0',
                }}>
                    <Typography variant="h5" sx={{ mb: 3, color: '#fff', fontWeight: 500 }}>
                        No Models Detected
                    </Typography>

                    <Typography sx={{ mb: 3, color: '#bbb' }}>
                        Ollama is running, but no models are installed. You need to pull a model to start chatting:
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography sx={{ mb: 2, color: '#fff' }}>
                            Pull a model to get started:
                        </Typography>
                        <CodeBlock
                            code="ollama pull llama2"
                            language="bash"
                        />
                    </Box>

                    <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                        After pulling a model, refresh this page to start chatting.
                    </Typography>
                </Box>
            </Box>
        );
    }

    const WindowsInstructions = () => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                Windows Installation
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ mb: 1, color: '#bbb' }}>
                    1. Download and run the Windows installer:
                </Typography>
                <Link 
                    href="https://ollama.ai/download/windows"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                >
                    https://ollama.ai/download/windows
                </Link>
            </Box>
            <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                After installation, Ollama will start automatically and show in the system tray.
            </Typography>
        </Box>
    );

    const MacInstructions = () => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                macOS Installation
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ mb: 1, color: '#bbb' }}>
                    Option 1: Using Homebrew
                </Typography>
                <CodeBlock
                    code="brew install ollama"
                    language="bash"
                />
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ mb: 1, color: '#bbb' }}>
                    Option 2: Download the app:
                </Typography>
                <Link 
                    href="https://ollama.ai/download/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                >
                    https://ollama.ai/download/mac
                </Link>
            </Box>
            <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                After installation, start Ollama from your Applications folder or run: ollama serve
            </Typography>
        </Box>
    );

    const LinuxInstructions = () => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                Linux Installation
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ mb: 1, color: '#bbb' }}>
                    Install using curl:
                </Typography>
                <CodeBlock
                    code="curl -fsSL https://ollama.ai/install.sh | sh"
                    language="bash"
                />
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ mb: 1, color: '#bbb' }}>
                    Start the Ollama service:
                </Typography>
                <CodeBlock
                    code="ollama serve"
                    language="bash"
                />
            </Box>
        </Box>
    );

    return (
        <Box sx={{
            height: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                width: '6px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#444',
                borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
            },
        }}>
            <Box sx={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 4,
                color: '#e0e0e0',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 500 }}>
                        Ollama Not Detected
                    </Typography>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#ff4444',
                            animation: `${pulse} 2s infinite`,
                        }}
                    />
                </Box>

                <Typography sx={{ mb: 4, color: '#bbb' }}>
                    We detected you're using {getDetectedOS()}. Follow these instructions to install Ollama:
                </Typography>

                {/* Show detected platform instructions */}
                {isWindows && <WindowsInstructions />}
                {isMac && <MacInstructions />}
                {isLinux && <LinuxInstructions />}

                {/* Toggle for other platforms */}
                <Button
                    onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                    startIcon={showAllPlatforms ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                        color: '#888',
                        textTransform: 'none',
                        mb: 3,
                        '&:hover': {
                            color: '#fff',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        }
                    }}
                >
                    {showAllPlatforms ? 'Hide' : 'Show'} instructions for other platforms
                </Button>

                {/* Other platforms when expanded */}
                {showAllPlatforms && (
                    <Box sx={{ mb: 4 }}>
                        {!isWindows && <WindowsInstructions />}
                        {!isMac && <MacInstructions />}
                        {!isLinux && <LinuxInstructions />}
                    </Box>
                )}

                {/* Common next steps */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                        Next Steps
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ mb: 1, color: '#bbb' }}>
                            After installation, pull a model to get started:
                        </Typography>
                        <CodeBlock
                            code="ollama pull llama2"
                            language="bash"
                        />
                    </Box>
                    <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                        After completing these steps, refresh this page. The chat will be ready to use once Ollama is running with at least one model installed.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default InstallInstructions;
