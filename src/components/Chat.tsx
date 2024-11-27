import React from "react";
import { Box, Snackbar, Alert, Theme } from "@mui/material";
import { Message } from "./chat/Message";
import { MessageInput } from "./chat/MessageInput";
import { ModelHeader } from "./chat/ModelHeader";
import { LoadingMessage } from "./chat/LoadingMessage";
import { useChat } from "../hooks/useChat";
import { useMessageCollapse } from "../hooks/useMessageCollapse";
import InstallInstructions from "./InstallInstructions";
import { isModelMultimodal } from "../services/ollamaService";

interface ChatProps {
  sessionId: number;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
  const {
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
  } = useChat(sessionId);

  const {
    isMessageExpanded,
    shouldShowExpandButton,
    getDisplayContent,
    toggleMessageExpansion,
  } = useMessageCollapse();

  // Render installation instructions if Ollama is not available
  if (!ollamaStatus.isAvailable) {
    return (
      <Box
        sx={{
          height: "100%",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InstallInstructions type="no-ollama" />
      </Box>
    );
  }

  if (!ollamaStatus.hasModels) {
    return (
      <Box
        sx={{
          height: "100%",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InstallInstructions type="no-models" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.default",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
          pointerEvents: "none",
          backgroundImage: (theme: Theme) => `
            radial-gradient(circle at 1px 1px, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)
          `,
          backgroundSize: "16px 16px",
        },
      }}
    >
      <ModelHeader model={model} />

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 3,
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          position: "relative",
          zIndex: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: (theme) =>
              theme.palette.mode === "dark" ? "#444" : "#ccc",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: (theme) =>
              theme.palette.mode === "dark" ? "#555" : "#bbb",
          },
        }}
      >
        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            index={index}
            isExpanded={isMessageExpanded(index)}
            shouldShowExpandButton={shouldShowExpandButton(message.content, message.role)}
            onToggleExpand={() => toggleMessageExpansion(index)}
            content={getDisplayContent(message.content, index, message.role)}
          />
        ))}
        {isLoading && <LoadingMessage />}
        <div ref={messagesEndRef} />
      </Box>

      <MessageInput
        input={input}
        setInput={setInput}
        selectedImage={selectedImage}
        isLoading={isLoading}
        isModelMultimodal={isModelMultimodal(model)}
        onSend={handleSend}
        onStop={handleStopGeneration}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        onKeyPress={handleKeyPress}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;
