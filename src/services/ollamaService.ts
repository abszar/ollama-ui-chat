interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
}

let currentContext: number[] | undefined;

const formatConversationHistory = (messages: { role: string; content: string }[]): string => {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return `Human: ${msg.content}`;
        } else {
            return `Assistant: ${msg.content}`;
        }
    }).join('\n\n') + '\n\nHuman: ';
};

export const generateTitle = async (content: string): Promise<string> => {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen2.5-coder',
                prompt: `Generate a short, concise title (max 6 words) for this chat based on this first message. Do not use quotes in your response: ${content}`,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate title');
        }

        const result = await response.json();
        // Remove any quotes from the title
        return result.response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('Error generating title:', error);
        return 'New Chat';
    }
};

export const streamResponse = async (
    messages: { role: string; content: string }[],
    onChunk: (chunk: string) => void,
    onComplete: () => void
): Promise<void> => {
    try {
        // Format the conversation history
        const conversationHistory = messages.slice(0, -1);
        const currentMessage = messages[messages.length - 1];
        const prompt = conversationHistory.length > 0 
            ? formatConversationHistory(conversationHistory) + currentMessage.content
            : currentMessage.content;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen2.5-coder',
                prompt: prompt,
                context: currentContext,
                stream: true
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate response');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to create stream reader');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                onComplete();
                break;
            }

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(Boolean);
            
            for (const line of lines) {
                try {
                    const json = JSON.parse(line) as OllamaResponse;
                    if (json.response) {
                        onChunk(json.response);
                    }
                    // Update context if available
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

export const resetContext = () => {
    currentContext = undefined;
};
