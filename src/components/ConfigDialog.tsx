import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  currentBaseUrl: string;
  onSave: (baseUrl: string) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({
  open,
  onClose,
  currentBaseUrl,
  onSave
}) => {
  const [baseUrl, setBaseUrl] = useState(currentBaseUrl);

  const handleSave = () => {
    onSave(baseUrl);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuration</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Ollama Base URL"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:11434"
            variant="outlined"
          />
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
