import { configService } from './configService';

// Response types
interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
}

interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
}

export type OllamaStatus = {
    isAvailable: boolean;
    hasModels: boolean;
};

// Store conversation context for continuous chat
let currentContext: number[] | undefined;

/**
 * Formats the conversation history into a prompt string
 * Adds appropriate prefixes for user and assistant messages
 */
const formatConversationHistory = (messages: { role: string; content: string }[]): string => {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return `Human: ${msg.content}`;
        } else {
            return `Assistant: ${msg.content}`;
        }
    }).join('\n\n') + '\n\nHuman: ';
};

/**
 * Checks if Ollama is available and has models installed
 */
export const checkOllamaStatus = async (): Promise<OllamaStatus> => {
    try {
        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) {
            return { isAvailable: false, hasModels: false };
        }
        const data = await response.json();
        return { 
            isAvailable: true, 
            hasModels: (data.models || []).length > 0 
        };
    } catch (error) {
        return { isAvailable: false, hasModels: false };
    }
};

/**
 * Retrieves the list of available Ollama models
 */
export const getAvailableModels = async (): Promise<OllamaModel[]> => {
    try {
        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
};

/**
 * Generates a title for a chat based on its first message
 */
export const generateTitle = async (content: string, model: string): Promise<string> => {
    try {
        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: `Generate a short, concise title (max 6 words) for this chat based on this first message. Do not use quotes in your response: ${content}`,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate title');
        }

        const result = await response.json();
        return result.response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('Error generating title:', error);
        return 'New Chat';
    }
};

/**
 * Streams a response from the Ollama API
 * Handles continuous conversation by maintaining context
 * Provides real-time updates through callbacks
 */
export const streamResponse = async (
    messages: { role: string; content: string }[],
    model: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void
): Promise<void> => {
    try {
        // Prepare the prompt using conversation history
        const conversationHistory = messages.slice(0, -1);
        const currentMessage = messages[messages.length - 1];
        const prompt = conversationHistory.length > 0 
            ? formatConversationHistory(conversationHistory) + currentMessage.content
            : currentMessage.content;

        // Make the API request
        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                context: currentContext,
                stream: true
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate response');
        }

        // Set up the stream reader
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to create stream reader');
        }

        // Process the stream
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                onComplete();
                break;
            }

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(Boolean);
            
            for (const line of lines) {
                try {
                    const json = JSON.parse(line) as OllamaResponse;
                    if (json.response) {
                        onChunk(json.response);
                    }
                    if (json.context) {
                        currentContext = json.context;
                    }
                } catch (e) {
                    console.error('Failed to parse chunk:', e);
                }
            }
        }
    } catch (error) {
        console.error('Error in stream:', error);
        throw error;
    }
};

/**
 * Resets the conversation context
 * Used when starting a new chat or switching between chats
 */
export const resetContext = () => {
    currentContext = undefined;
};
