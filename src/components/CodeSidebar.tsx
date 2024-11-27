import React from 'react';
import { Box, IconButton, Paper, useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useCodeSidebarStore } from '../store/codeSidebarStore';
import CodeBlock from './CodeBlock';
import { useCodeSidebarResize } from '../hooks/useCodeSidebarResize';

export const CodeSidebar: React.FC = () => {
    const theme = useTheme();
    const { width, isResizing, startResizing } = useCodeSidebarResize();
    const { isOpen, code, language, closeSidebar } = useCodeSidebarStore();

    if (!isOpen || !code || !language) return null;

    return (
        <Paper
            elevation={2}
            sx={{
                width,
                backgroundColor: theme.palette.background.paper,
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                userSelect: isResizing ? 'none' : 'auto',
                flexShrink: 0,
                height: '100%',
                transition: 'width 0.2s ease',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Box sx={{ pl: 1, fontSize: '0.9rem', color: theme.palette.text.secondary }}>
                    Code View
                </Box>
                <IconButton onClick={closeSidebar} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.mode === 'dark' ? '#444' : '#ccc',
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: theme.palette.mode === 'dark' ? '#555' : '#bbb',
                },
            }}>
                <CodeBlock code={code} language={language} inSidebar={true} />
            </Box>

            {/* Resize Handle */}
            <Box
                onMouseDown={startResizing}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: -4,
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
        </Paper>
    );
};
