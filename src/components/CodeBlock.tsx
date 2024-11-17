import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Fade } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('css', css);

export interface CodeBlockProps {
    code: string;
    language: string;
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

const customStyle = {
    ...atomOneDark,
    hljs: {
        ...atomOneDark.hljs,
        background: '#282c34',
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

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
    const [showCopy, setShowCopy] = useState(false);
    const [copied, setCopied] = useState(false);
    const normalizedLanguage = normalizeLanguage(language);

    const handleCopy = async () => {
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

    return (
        <Paper 
            elevation={2}
            sx={{
                mt: 1,
                mb: 1,
                overflow: 'hidden',
                backgroundColor: '#282c34',
                borderRadius: 1,
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                position: 'relative'
            }}
            onMouseEnter={() => setShowCopy(true)}
            onMouseLeave={() => setShowCopy(false)}
        >
            <Box
                sx={{
                    backgroundColor: '#21252b',
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid #181a1f',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: '#abb2bf',
                        textTransform: 'lowercase',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                    }}
                >
                    {language}
                </Typography>
                <Fade in={showCopy}>
                    <Tooltip 
                        title={copied ? "Copied!" : "Copy code"} 
                        placement="left"
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
            <Box sx={{ overflowX: 'auto' }}>
                <SyntaxHighlighter
                    language={normalizedLanguage}
                    style={customStyle}
                    showLineNumbers
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        backgroundColor: 'transparent'
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
