import { ChatSession, ChatMessage } from '../types/database';

class DatabaseService {
    private waitForDatabase(): Promise<void> {
        return new Promise((resolve) => {
            if ((window as any).database) {
                resolve();
                return;
            }

            const checkInterval = setInterval(() => {
                if ((window as any).database) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    async createChatSession(title: string): Promise<ChatSession> {
        await this.waitForDatabase();
        return (window as any).database.createChatSession(title);
    }

    async getChatSessions(): Promise<ChatSession[]> {
        await this.waitForDatabase();
        return (window as any).database.getChatSessions();
    }

    async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
        await this.waitForDatabase();
        return (window as any).database.getChatMessages(sessionId);
    }

    async addChatMessage(sessionId: number, role: 'user' | 'assistant', content: string): Promise<ChatMessage> {
        await this.waitForDatabase();
        return (window as any).database.addChatMessage(sessionId, role, content);
    }

    async deleteChatSession(sessionId: number): Promise<void> {
        await this.waitForDatabase();
        return (window as any).database.deleteChatSession(sessionId);
    }

    async updateChatSessionTitle(sessionId: number, title: string): Promise<void> {
        await this.waitForDatabase();
        return (window as any).database.updateChatSessionTitle(sessionId, title);
    }

    async getFirstMessageContent(sessionId: number): Promise<string> {
        await this.waitForDatabase();
        return (window as any).database.getFirstMessageContent(sessionId);
    }
}

export const databaseService = new DatabaseService();
