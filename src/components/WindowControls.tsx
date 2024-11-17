import React from 'react';
import { Box, SvgIcon } from '@mui/material';

const WindowControls: React.FC = () => {
  const handleClose = () => {
    if (window.require) {
      const { BrowserWindow } = window.require('@electron/remote');
      const currentWindow = BrowserWindow.getFocusedWindow();
      if (currentWindow) currentWindow.close();
    }
  };

  const handleMinimize = () => {
    if (window.require) {
      const { BrowserWindow } = window.require('@electron/remote');
      const currentWindow = BrowserWindow.getFocusedWindow();
      if (currentWindow) currentWindow.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.require) {
      const { BrowserWindow } = window.require('@electron/remote');
      const currentWindow = BrowserWindow.getFocusedWindow();
      if (currentWindow) {
        if (currentWindow.isMaximized()) {
          currentWindow.unmaximize();
        } else {
          currentWindow.maximize();
        }
      }
    }
  };

  const buttonBaseStyle = {
    width: '45px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#607d8b',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(96, 125, 139, 0.1)',
      color: '#78909c',
    },
  };

  const closeButtonStyle = {
    ...buttonBaseStyle,
    '&:hover': {
      backgroundColor: '#e81123',
      color: '#ffffff',
    },
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '0',
        right: '0',
        height: '32px',
        display: 'flex',
        alignItems: 'stretch',
        WebkitAppRegion: 'no-drag',
        zIndex: 1000,
      }}
    >
      <Box
        onClick={handleMinimize}
        sx={buttonBaseStyle}
        title="Minimize"
      >
        <SvgIcon sx={{ fontSize: 18 }}>
          <path d="M19 13H5v-2h14v2z" />
        </SvgIcon>
      </Box>
      <Box
        onClick={handleMaximize}
        sx={buttonBaseStyle}
        title="Maximize"
      >
        <SvgIcon sx={{ fontSize: 18 }}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
        </SvgIcon>
      </Box>
      <Box
        onClick={handleClose}
        sx={closeButtonStyle}
        title="Close"
      >
        <SvgIcon sx={{ fontSize: 18 }}>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </SvgIcon>
      </Box>
    </Box>
  );
};

export default WindowControls;
