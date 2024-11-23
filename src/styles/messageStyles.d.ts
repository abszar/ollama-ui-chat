import { Theme } from "@mui/material";

export declare function messageStyles(theme: Theme): {
  messageContainer: (role: string) => {
    display: string;
    justifyContent: string;
    maxWidth: string;
    gap: number;
    alignItems: string;
  };
  messageContent: (role: string) => {
    maxWidth: string;
    backgroundColor: string;
    color: string;
    borderRadius: string;
    px: number;
    py: number;
    boxShadow: string;
    overflowWrap: string;
    wordWrap: string;
    wordBreak: string;
    hyphens: string;
  };
  assistantAvatar: {
    bgcolor: string;
    width: number;
    height: number;
  };
  userAvatar: {
    bgcolor: string;
    width: number;
    height: number;
  };
  avatarIcon: {
    fontSize: number;
    color: string | undefined;
  };
  imageContainer: {
    mb: number;
  };
  image: {
    maxWidth: string;
    maxHeight: string;
    width: string;
    height: string;
    borderRadius: string;
    objectFit: "contain";
  };
  expandButton: {
    mt: number;
    textTransform: string;
    color: string;
    "&:hover": {
      backgroundColor: string;
    };
  };
};
