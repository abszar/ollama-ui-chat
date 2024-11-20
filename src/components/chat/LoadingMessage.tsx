import React from "react";
import { Box, useTheme } from "@mui/material";
import LoadingDots from "../LoadingDots";

export const LoadingMessage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        maxWidth: "100%",
        px: 6, // Add left padding to align with message content
      }}
    >
      <LoadingDots />
    </Box>
  );
};
