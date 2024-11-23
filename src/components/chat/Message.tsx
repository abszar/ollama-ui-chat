import React from "react";
import { Box, Avatar, Button, IconButton, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message as MessageType } from "../../types/chat";
import { useTheme } from "@mui/material";
import { messageStyles } from "../../styles/messageStyles";
import { MarkdownComponents } from "./MarkdownComponents";
import { speechService } from "../../services/speechService";

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
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const handleSpeak = () => {
    try {
      if (isSpeaking) {
        speechService.stop();
        setIsSpeaking(false);
      } else {
        // Remove markdown syntax and clean up the text before speaking
        const plainText = content
          .replace(/[#*`_~\[\]]/g, '')
          .replace(/\n+/g, ' ')
          .trim();

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechService.speak(plainText);
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speaking when component unmounts or content changes
  React.useEffect(() => {
    return () => {
      if (isSpeaking) {
        speechService.stop();
        setIsSpeaking(false);
      }
    };
  }, [isSpeaking, content]);

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
        {message.role === "assistant" && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <Tooltip title={isSpeaking ? "Stop speaking" : "Read message"}>
              <IconButton 
                onClick={handleSpeak}
                size="small"
                sx={{ color: theme.palette.text.secondary }}
              >
                {isSpeaking ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
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
