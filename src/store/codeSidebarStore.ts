import { create } from 'zustand';

interface CodeSidebarState {
    isOpen: boolean;
    code: string | null;
    language: string | null;
    openSidebar: (code: string, language: string) => void;
    closeSidebar: () => void;
}

export const useCodeSidebarStore = create<CodeSidebarState>((set) => ({
    isOpen: false,
    code: null,
    language: null,
    openSidebar: (code: string, language: string) => set({ isOpen: true, code, language }),
    closeSidebar: () => set({ isOpen: false, code: null, language: null }),
}));
