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

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkOllamaStatus();
      setOllamaStatus(status);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    const loadChat = () => {
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

    const currentInput = input.trim();
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
      setMessages(updatedMessages);

      if (messages.length === 0) {
        const title = await generateTitle(currentInput, model);
        storageService.updateChatSessionTitle(sessionId, title);
      }

      let assistantMessage: Message = {
        role: "assistant",
        content: "",
      };

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
      console.error("Error generating response:", error);
      setIsLoading(false);
      setError(error.message || "Failed to generate response. Please try again.");
      setMessages(messages);
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
