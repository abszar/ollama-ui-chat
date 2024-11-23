import { Theme } from "@mui/material";

type MessageStylesType = {
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
    "& pre": {
      margin: string;
      whiteSpace: string;
      wordBreak: string;
    };
    "& code": {
      whiteSpace: string;
      wordBreak: string;
    };
    "& p:first-of-type": {
      marginTop: number;
    };
    "& p:last-of-type": {
      marginBottom: number;
    };
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

export const messageStyles = (theme: Theme): MessageStylesType => ({
  messageContainer: (role: string) => ({
    display: "flex",
    justifyContent: role === "user" ? "flex-end" : "flex-start",
    maxWidth: "100%",
    gap: 2,
    alignItems: "flex-start",
  }),

  messageContent: (role: string) => ({
    maxWidth: role === "user" ? "60%" : "75%",
    backgroundColor:
      role === "user"
        ? theme.palette.mode === "dark"
          ? "#333333"
          : "#e3f2fd"
        : "transparent",
    color: theme.palette.text.primary,
    borderRadius: role === "user" ? "12px" : "0px",
    px: role === "user" ? 2 : 0,
    py: role === "user" ? 1.5 : 0,
    boxShadow: role === "user" ? theme.shadows[1] : "none",
    overflowWrap: "break-word",
    wordWrap: "break-word",
    wordBreak: "break-word",
    hyphens: "auto",
    "& pre": {
      margin: "0.5em 0",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    "& code": {
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    "& p:first-of-type": {
      marginTop: 0,
    },
    "& p:last-of-type": {
      marginBottom: 0,
    },
  }),

  assistantAvatar: {
    bgcolor: theme.palette.mode === "dark" ? "#2f2f2f" : "#e3e3e3",
    width: 32,
    height: 32,
  },

  userAvatar: {
    bgcolor: theme.palette.primary.main,
    width: 32,
    height: 32,
  },

  avatarIcon: {
    fontSize: 20,
    color: theme.palette.mode === "dark" ? theme.palette.text.secondary : undefined,
  },

  imageContainer: {
    mb: 2,
  },

  image: {
    maxWidth: "250px",
    maxHeight: "250px",
    width: "auto",
    height: "auto",
    borderRadius: "8px",
    objectFit: "contain" as const,
  },

  expandButton: {
    mt: 1,
    textTransform: "none",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
  },
});

export type { MessageStylesType };
