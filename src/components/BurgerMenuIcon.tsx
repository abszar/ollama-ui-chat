import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const BurgerMenuIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="6" width="18" height="2" rx="1" />
      <rect x="3" y="11" width="18" height="2" rx="1" />
      <rect x="3" y="16" width="10" height="2" rx="1" />
    </svg>
  </SvgIcon>
);
