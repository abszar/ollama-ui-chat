import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
        localStorage.setItem(STORAGE_KEY, String(newWidth));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = () => {
    setIsResizing(true);
  };

  return {
    width,
    isResizing,
    startResizing,
  };
};
