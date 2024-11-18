import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Divider
} from '@mui/material';
import { ThemeMode } from '../services/configService';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  currentBaseUrl: string;
  currentTheme: ThemeMode;
  onSave: (baseUrl: string, theme: ThemeMode) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({
  open,
  onClose,
  currentBaseUrl,
  currentTheme,
  onSave
}) => {
  const [baseUrl, setBaseUrl] = useState(currentBaseUrl);
  const [theme, setTheme] = useState<ThemeMode>(currentTheme);

  const handleSave = () => {
    onSave(baseUrl, theme);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuration</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              API Configuration
            </Typography>
            <TextField
              fullWidth
              label="Ollama Base URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              variant="outlined"
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                />
              }
              label="Dark Mode"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog;
