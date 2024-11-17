import React from 'react';
import { Box, keyframes } from '@mui/material';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
`;

const LoadingDots: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: '4px',
      padding: '4px 0',
      '& > span': {
        width: '6px',
        height: '6px',
        backgroundColor: '#666',
        borderRadius: '50%',
        display: 'inline-block',
      },
      '& > span:nth-of-type(1)': {
        animation: `${bounce} 1.4s -0.32s infinite ease-in-out both`,
      },
      '& > span:nth-of-type(2)': {
        animation: `${bounce} 1.4s -0.16s infinite ease-in-out both`,
      },
      '& > span:nth-of-type(3)': {
        animation: `${bounce} 1.4s 0s infinite ease-in-out both`,
      },
    }}>
      <span />
      <span />
      <span />
    </Box>
  );
};

export default LoadingDots;
