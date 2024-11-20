import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

interface ModelHeaderProps {
  model: string;
}

export const ModelHeader: React.FC<ModelHeaderProps> = ({ model }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 3,
        py: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(10px)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,0,0,0.02)",
      }}
    >
      <SmartToyIcon sx={{ color: theme.palette.text.disabled }} />
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      >
        {model}
      </Typography>
    </Box>
  );
};
