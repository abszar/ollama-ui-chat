import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Fade } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useCodeSidebarStore } from '../store/codeSidebarStore';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('css', css);

export interface CodeBlockProps {
    code: string;
    language: string;
    isGenerating?: boolean;
    inSidebar?: boolean;
}

const normalizeLanguage = (language: string): string => {
    const languageMap: { [key: string]: string } = {
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'json': 'javascript',
        'xml': 'html'
    };

    return languageMap[language.toLowerCase()] || 'javascript';
};

const BACKGROUND_COLOR = '#282c34';
const HOVER_COLOR = '#2c313a';

const customStyle = {
    ...atomOneDark,
    hljs: {
        ...atomOneDark.hljs,
        background: 'transparent',
        color: '#abb2bf'
    },
    'hljs-keyword': {
        color: '#c678dd'
    },
    'hljs-string': {
        color: '#98c379'
    },
    'hljs-function': {
        color: '#61afef'
    },
    'hljs-number': {
        color: '#d19a66'
    },
    'hljs-comment': {
        color: '#5c6370',
        fontStyle: 'italic'
    },
    'hljs-class': {
        color: '#e5c07b'
    },
    'hljs-tag': {
        color: '#e06c75'
    },
    'hljs-attr': {
        color: '#d19a66'
    },
    'hljs-symbol': {
        color: '#56b6c2'
    },
    'hljs-meta': {
        color: '#61afef'
    },
    'hljs-variable': {
        color: '#e06c75'
    }
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, isGenerating, inSidebar = false }) => {
    const [showCopy, setShowCopy] = useState(false);
    const [copied, setCopied] = useState(false);
    const normalizedLanguage = normalizeLanguage(language);
    const openSidebar = useCodeSidebarStore(state => state.openSidebar);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleExpand = () => {
        openSidebar(code, language);
    };

    return (
        <Paper 
            elevation={2}
            onClick={!inSidebar ? handleExpand : undefined}
            sx={{
                mt: 1,
                mb: 1,
                overflow: 'hidden',
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: '20px',
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                position: 'relative',
                cursor: !inSidebar ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': !inSidebar ? {
                    backgroundColor: HOVER_COLOR,
                    transform: 'scale(1.002)',
                } : {},
            }}
            onMouseEnter={() => setShowCopy(true)}
            onMouseLeave={() => setShowCopy(false)}
        >
            <Box
                sx={{
                    backgroundColor: BACKGROUND_COLOR,
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                }}
            >
                <Typography
                    sx={{
                        color: '#abb2bf',
                        textTransform: 'lowercase',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                    }}
                >
                    {language}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!inSidebar && (
                        <Fade in={showCopy}>
                            <Tooltip title="Open in sidebar" placement="top" arrow>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExpand();
                                    }}
                                    sx={{
                                        color: '#abb2bf',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    <OpenInFullIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Fade>
                    )}
                    <Fade in={showCopy}>
                        <Tooltip 
                            title={copied ? "Copied!" : "Copy code"} 
                            placement="top"
                            arrow
                        >
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    color: copied ? '#98c379' : '#abb2bf',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </Fade>
                </Box>
            </Box>
            <Box 
                sx={{ 
                    backgroundColor: BACKGROUND_COLOR,
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                }}
            >
                <SyntaxHighlighter
                    language={normalizedLanguage}
                    style={customStyle}
                    showLineNumbers
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        backgroundColor: 'transparent',
                        borderBottomLeftRadius: '20px',
                        borderBottomRightRadius: '20px',
                    }}
                    lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1em',
                        textAlign: 'right',
                        color: '#495162',
                        borderRight: '1px solid #3b4048',
                        marginRight: '1em'
                    }}
                    wrapLines
                    wrapLongLines
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </Box>
        </Paper>
    );
};

export default CodeBlock;
