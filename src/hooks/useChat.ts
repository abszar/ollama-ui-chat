import { useState, useEffect, useRef } from "react";
import { Message } from "../types/chat";
import { storageService } from "../services/storageService";
import {
  streamResponse,
  generateTitle,
  checkOllamaStatus,
  isModelMultimodal,
  stopStream,
} from "../services/ollamaService";

export const useChat = (sessionId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<{
    isAvailable: boolean;
    hasModels: boolean;
  }>({
    isAvailable: false,
    hasModels: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkOllamaStatus();
        setOllamaStatus(status);
      } catch (error) {
        console.error("Error checking Ollama status:", error);
      }
    };

    // Initial check
    checkStatus();

    // Set up polling interval (every 3 seconds)
    const intervalId = setInterval(checkStatus, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const chatMessages = storageService.getChatMessages(sessionId);
        const chatModel = storageService.getChatModel(sessionId);
        setMessages(
          chatMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            image: msg.image,
          }))
        );
        setModel(chatModel);

        // If there's a user message but no assistant response, generate one
        if (chatMessages.length === 1 && chatMessages[0].role === 'user') {
          const userMessage = chatMessages[0];
          const assistantMessage: Message = {
            role: "assistant",
            content: "",
          };

          setIsLoading(true);
          setMessages([userMessage, assistantMessage]);

          await streamResponse(
            [userMessage],
            chatModel,
            (chunk) => {
              assistantMessage.content += chunk;
              setMessages([userMessage, { ...assistantMessage }]);
            },
            async () => {
              storageService.addChatMessage(
                sessionId,
                assistantMessage.role,
                assistantMessage.content
              );
              setIsLoading(false);
            }
          );
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        setError("Failed to load messages");
      }
    };

    if (ollamaStatus.isAvailable && ollamaStatus.hasModels) {
      loadChat();
    }
  }, [sessionId, ollamaStatus]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading file:", error);
        setError("Failed to read image file");
      }
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStopGeneration = () => {
    stopStream();
    setIsLoading(false);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    if (selectedImage && !isModelMultimodal(model)) {
      setError(
        "Current model does not support image input. Please use llava or bakllava models for image analysis."
      );
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      image: selectedImage || undefined,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
    };

    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      setIsLoading(true);
      setError(null);

      storageService.addChatMessage(
        sessionId,
        userMessage.role,
        userMessage.content,
        userMessage.image
      );

      const updatedMessages = [...messages, userMessage];
      setMessages([...updatedMessages, assistantMessage]);

      await streamResponse(
        updatedMessages,
        model,
        (chunk) => {
          assistantMessage.content += chunk;
          setMessages([...updatedMessages, { ...assistantMessage }]);
        },
        async () => {
          storageService.addChatMessage(
            sessionId,
            assistantMessage.role,
            assistantMessage.content
          );
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message. Please try again.");
      setMessages([...messages, userMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    setError,
    model,
    selectedImage,
    ollamaStatus,
    fileInputRef,
    messagesEndRef,
    handleImageSelect,
    handleImageRemove,
    handleSend,
    handleKeyPress,
    handleStopGeneration,
  };
};
