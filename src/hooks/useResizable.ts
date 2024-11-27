import { useState, useEffect, useCallback } from 'react';

const MIN_WIDTH = 328;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 328;
const STORAGE_KEY = 'sidebar-width';

export const useResizable = () => {
  const [width, setWidth] = useState(() => {
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    return savedWidth ? Math.max(MIN_WIDTH, Number(savedWidth)) : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
    requestAnimationFrame(() => {
      setWidth(newWidth);
      localStorage.setItem(STORAGE_KEY, String(newWidth));
    });
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  return {
    width,
    isResizing,
    startResizing,
  };
};
