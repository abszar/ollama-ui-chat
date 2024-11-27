import React, { useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedImage: string | null;
  isLoading: boolean;
  isModelMultimodal: boolean;
  onSend: () => void;
  onStop: () => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  selectedImage,
  isLoading,
  isModelMultimodal,
  onSend,
  onStop,
  onImageSelect,
  onImageRemove,
  onKeyPress,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'transparent',
      }}
    >
      {selectedImage && (
        <Box
          sx={{
            maxWidth: "900px",
            margin: "0 auto 1rem auto",
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            src={selectedImage}
            alt="Selected"
            style={{
              maxWidth: "150px",
              maxHeight: "150px",
              width: "auto",
              height: "auto",
              borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`,
              objectFit: "contain",
            }}
          />
          <IconButton
            onClick={onImageRemove}
            size="small"
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
          backgroundColor: theme.palette.mode === "dark" ? "#2a2a2a" : "#fff",
          borderRadius: "16px",
          padding: "8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? "#2f2f2f" : "#fafafa",
          },
          "&:focus-within": {
            backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
          },
        }}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={onImageSelect}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || !isModelMultimodal}
          sx={{
            color: theme.palette.primary.main,
            "&.Mui-disabled": {
              color: theme.palette.action.disabled,
            },
          }}
        >
          <ImageIcon />
        </IconButton>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
          disabled={isLoading}
          variant="standard"
          sx={{
            flex: 1,
            "& .MuiInputBase-root": {
              padding: "4px 8px",
              fontSize: "0.95rem",
              lineHeight: "1.5",
              "&:before, &:after": {
                display: "none",
              },
            },
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
              padding: "4px 0",
              "&::placeholder": {
                color: theme.palette.text.disabled,
                opacity: 1,
              },
            },
          }}
        />
        {isLoading ? (
          <IconButton
            onClick={onStop}
            sx={{
              backgroundColor: theme.palette.error.main,
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              marginBottom: "4px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: theme.palette.error.dark,
                transform: "scale(1.05)",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "1.2rem",
                color: "white",
              },
            }}
          >
            <StopIcon />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            onClick={onSend}
            disabled={(!input.trim() && !selectedImage)}
            sx={{
              backgroundColor: "primary.main",
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              marginBottom: "4px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.05)",
              },
              "&.Mui-disabled": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "1.2rem",
                color: "white",
                transition: "transform 0.2s ease",
              },
              "&:hover .MuiSvgIcon-root": {
                transform: "translateX(2px)",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
