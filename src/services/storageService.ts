import { ChatSession, ChatMessage, StorageService } from '../types/storage';

class LocalStorageService implements StorageService {
    private getNextId(key: string): number {
        const items = this.getAllItems(key);
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    }

    private getAllItems(key: string): any[] {
        const items = localStorage.getItem(key);
        return items ? JSON.parse(items) : [];
    }

    private setItems(key: string, items: any[]): void {
        localStorage.setItem(key, JSON.stringify(items));
    }

    createChatSession(title: string, model: string): ChatSession {
        const sessions = this.getAllItems('chat_sessions');
        const newSession: ChatSession = {
            id: this.getNextId('chat_sessions'),
            title,
            model,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        sessions.push(newSession);
        this.setItems('chat_sessions', sessions);
        return newSession;
    }

    getChatSessions(): ChatSession[] {
        return this.getAllItems('chat_sessions')
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    getChatMessages(sessionId: number): ChatMessage[] {
        return this.getAllItems('chat_messages')
            .filter(msg => msg.session_id === sessionId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    addChatMessage(sessionId: number, role: 'user' | 'assistant', content: string): ChatMessage {
        const messages = this.getAllItems('chat_messages');
        const newMessage: ChatMessage = {
            id: this.getNextId('chat_messages'),
            session_id: sessionId,
            role,
            content,
            created_at: new Date().toISOString()
        };
        messages.push(newMessage);
        this.setItems('chat_messages', messages);

        // Update session's updated_at timestamp
        const sessions = this.getAllItems('chat_sessions');
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            sessions[sessionIndex].updated_at = new Date().toISOString();
            this.setItems('chat_sessions', sessions);
        }

        return newMessage;
    }

    deleteChatSession(sessionId: number): void {
        // Delete session
        const sessions = this.getAllItems('chat_sessions')
            .filter(session => session.id !== sessionId);
        this.setItems('chat_sessions', sessions);

        // Delete associated messages
        const messages = this.getAllItems('chat_messages')
            .filter(message => message.session_id !== sessionId);
        this.setItems('chat_messages', messages);
    }

    updateChatSessionTitle(sessionId: number, title: string): void {
        const sessions = this.getAllItems('chat_sessions');
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            sessions[sessionIndex].title = title;
            sessions[sessionIndex].updated_at = new Date().toISOString();
            this.setItems('chat_sessions', sessions);
        }
    }

    getFirstMessageContent(sessionId: number): string {
        const messages = this.getChatMessages(sessionId);
        return messages.length > 0 ? messages[0].content : 'New Chat';
    }

    getChatModel(sessionId: number): string {
        const sessions = this.getAllItems('chat_sessions');
        const session = sessions.find(s => s.id === sessionId);
        return session?.model || '';
    }
}

export const storageService = new LocalStorageService();
