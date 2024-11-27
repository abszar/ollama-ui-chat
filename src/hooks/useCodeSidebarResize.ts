import { useState, useEffect, useCallback } from 'react';

const MIN_WIDTH = 400;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 500;
const STORAGE_KEY = 'code-sidebar-width';

interface UseResizableProps {
    initialWidth?: number;
}

export const useCodeSidebarResize = ({ initialWidth = DEFAULT_WIDTH }: UseResizableProps = {}) => {
    const [width, setWidth] = useState(() => {
        const savedWidth = localStorage.getItem(STORAGE_KEY);
        return savedWidth ? Math.max(MIN_WIDTH, Number(savedWidth)) : initialWidth;
    });
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        
        const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, MIN_WIDTH), MAX_WIDTH);
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
