import { useState, useEffect } from 'react';

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

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            
            const newWidth = window.innerWidth - e.clientX;
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
