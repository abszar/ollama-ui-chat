export interface ChatSession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: number;
    session_id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Database {
    createChatSession: (title: string) => ChatSession;
    getChatSessions: () => ChatSession[];
    getChatMessages: (sessionId: number) => ChatMessage[];
    addChatMessage: (sessionId: number, role: 'user' | 'assistant', content: string) => ChatMessage;
    deleteChatSession: (sessionId: number) => void;
    updateChatSessionTitle: (sessionId: number, title: string) => void;
    getFirstMessageContent: (sessionId: number) => string;
}

declare global {
    interface Window {
        database: Database;
    }
}
