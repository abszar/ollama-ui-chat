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

export interface OllamaLibraryModel {
    name: string;
    description: string;
    tags: string[];
    size?: string;
}

export type OllamaStatus = {
    isAvailable: boolean;
    hasModels: boolean;
};

export interface ModelPullProgress {
    status: string;
    digest?: string;
    total?: number;
    completed?: number;
}

// Store conversation context for continuous chat
let currentContext: number[] | undefined;

// Store the current AbortController
let currentAbortController: AbortController | null = null;

// Default models list from Ollama
const DEFAULT_MODELS: OllamaLibraryModel[] = [
    {
        name: "llama2",
        description: "Meta's Llama 2 LLM, fine-tuned for chat",
        tags: ["chat", "general"],
        size: "3.8GB"
    },
    {
        name: "llama2:13b",
        description: "Meta's Llama 2 13B parameter LLM, fine-tuned for chat",
        tags: ["chat", "general"],
        size: "7.3GB"
    },
    {
        name: "llama2:70b",
        description: "Meta's Llama 2 70B parameter LLM, fine-tuned for chat",
        tags: ["chat", "general"],
        size: "39GB"
    },
    {
        name: "codellama",
        description: "Meta's Llama 2 based model, fine-tuned for coding tasks",
        tags: ["coding", "programming"],
        size: "3.8GB"
    },
    {
        name: "codellama:13b",
        description: "Meta's Llama 2 13B parameter model, fine-tuned for coding tasks",
        tags: ["coding", "programming"],
        size: "7.3GB"
    },
    {
        name: "codellama:34b",
        description: "Meta's Llama 2 34B parameter model, fine-tuned for coding tasks",
        tags: ["coding", "programming"],
        size: "19.1GB"
    },
    {
        name: "mistral",
        description: "Mistral AI's 7B parameter model, offering strong performance",
        tags: ["chat", "general"],
        size: "4.1GB"
    },
    {
        name: "mixtral",
        description: "Mistral AI's latest model with improved capabilities",
        tags: ["chat", "general"],
        size: "26GB"
    },
    {
        name: "llava",
        description: "Multimodal model capable of understanding images",
        tags: ["vision", "multimodal"],
        size: "4.1GB"
    },
    {
        name: "orca-mini",
        description: "Smaller, faster model optimized for chat",
        tags: ["chat", "fast"],
        size: "4GB"
    },
    {
        name: "neural-chat",
        description: "Intel's neural chat model optimized for conversation",
        tags: ["chat", "fast"],
        size: "4GB"
    },
    {
        name: "starling-lm",
        description: "Berkeley's Starling LM model trained on human feedback",
        tags: ["chat", "general"],
        size: "4.1GB"
    },
    {
        name: "phi",
        description: "Microsoft's Phi-2 small language model",
        tags: ["chat", "fast"],
        size: "2.7GB"
    }
];

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
 * Returns the list of available models from Ollama's library
 */
export const getLibraryModels = async (): Promise<OllamaLibraryModel[]> => {
    return DEFAULT_MODELS;
};

/**
 * Deletes a model from Ollama
 */
export const deleteModel = async (modelName: string): Promise<void> => {
    try {
        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: modelName }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete model');
        }
    } catch (error) {
        console.error('Error deleting model:', error);
        throw error;
    }
};

/**
 * Cancels the current model installation
 */
export const cancelModelInstall = () => {
    if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
    }
};

/**
 * Installs a model from the Ollama library
 * @param modelName The name of the model to install (e.g., "llama2", "codellama")
 * @param onProgress Callback for installation progress updates
 */
export const installModel = async (
    modelName: string,
    onProgress: (progress: ModelPullProgress) => void
): Promise<void> => {
    try {
        // Create new AbortController for this installation
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;

        const baseUrl = configService.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/pull`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: modelName }),
            signal, // Add abort signal to the request
        });

        if (!response.ok) {
            throw new Error('Failed to start model installation');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to create stream reader');
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(Boolean);

                for (const line of lines) {
                    try {
                        const progress = JSON.parse(line);
                        onProgress(progress);
                    } catch (e) {
                        console.error('Failed to parse progress:', e);
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Installation cancelled');
            }
            throw error;
        } finally {
            currentAbortController = null;
        }
    } catch (error) {
        console.error('Error installing model:', error);
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
