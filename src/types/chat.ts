export interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
}

export interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}
