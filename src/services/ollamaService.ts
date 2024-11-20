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

// Store the current AbortController
let currentAbortController: AbortController | null = null;

/**
 * Formats the conversation history into a prompt string
 * Adds appropriate prefixes for user and assistant messages
 */
const formatConversationHistory = (messages: { role: string; content: string; image?: string }[]): string => {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return `Human: ${msg.content}`;
        } else {
            return `Assistant: ${msg.content}`;
        }
    }).join('\n\n') + '\n\nHuman: ';
};

/**
 * Extracts base64 data from a data URL
 */
const extractBase64FromDataUrl = (dataUrl: string): string => {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
        return matches[2];
    }
    return '';
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
 * Stops the current response stream
 */
export const stopStream = () => {
    if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
    }
};

/**
 * Streams a response from the Ollama API
 * Handles continuous conversation by maintaining context
 * Provides real-time updates through callbacks
 */
export const streamResponse = async (
    messages: { role: string; content: string; image?: string }[],
    model: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void
): Promise<void> => {
    try {
        // Create new AbortController for this stream
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;

        // Prepare the prompt using conversation history
        const conversationHistory = messages.slice(0, -1);
        const currentMessage = messages[messages.length - 1];
        const prompt = conversationHistory.length > 0 
            ? formatConversationHistory(conversationHistory) + currentMessage.content
            : currentMessage.content;

        // Prepare request body
        const requestBody: any = {
            model: model,
            prompt: prompt,
            context: currentContext,
            stream: true
        };

        // Add image data if present
        if (currentMessage.image) {
            const base64Data = extractBase64FromDataUrl(currentMessage.image);
            if (base64Data) {
                requestBody.images = [base64Data];
            }
        }

        // Make the API request
        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal, // Add abort signal to the request
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
        try {
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
            if (error instanceof Error && error.name === 'AbortError') {
                onComplete();
                return;
            }
            throw error;
        } finally {
            currentAbortController = null;
        }
    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error in stream:', error);
            throw error;
        }
    }
};

/**
 * Resets the conversation context
 * Used when starting a new chat or switching between chats
 */
export const resetContext = () => {
    currentContext = undefined;
};

/**
 * Checks if a model supports image input
 */
export const isModelMultimodal = (model: string): boolean => {
    const multimodalModels = ['llava', 'bakllava'];
    return multimodalModels.some(m => model.toLowerCase().startsWith(m));
};
