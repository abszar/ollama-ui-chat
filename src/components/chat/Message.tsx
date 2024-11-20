import React from "react";
import { Box, Avatar, Button } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message as MessageType } from "../../types/chat";
import { useTheme } from "@mui/material";
import { messageStyles } from "../../styles/messageStyles";
import { MarkdownComponents } from "./MarkdownComponents";

interface MessageProps {
  message: MessageType;
  index: number;
  isExpanded: boolean;
  shouldShowExpandButton: boolean;
  onToggleExpand: () => void;
  content: string;
}

export const Message: React.FC<MessageProps> = ({
  message,
  index,
  isExpanded,
  shouldShowExpandButton,
  onToggleExpand,
  content,
}) => {
  const theme = useTheme();
  const styles = messageStyles(theme);

  return (
    <Box sx={styles.messageContainer(message.role)}>
      {message.role === "assistant" && (
        <Avatar sx={styles.assistantAvatar}>
          <SmartToyIcon sx={styles.avatarIcon} />
        </Avatar>
      )}
      <Box sx={styles.messageContent(message.role)}>
        {message.image && (
          <Box sx={styles.imageContainer}>
            <img
              src={message.image}
              alt="User uploaded"
              style={styles.image}
            />
          </Box>
        )}
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents(theme)}>
          {content}
        </ReactMarkdown>
        {shouldShowExpandButton && (
          <Button
            onClick={onToggleExpand}
            size="small"
            endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={styles.expandButton}
          >
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        )}
      </Box>
      {message.role === "user" && (
        <Avatar sx={styles.userAvatar}>
          <PersonIcon sx={styles.avatarIcon} />
        </Avatar>
      )}
    </Box>
  );
};
