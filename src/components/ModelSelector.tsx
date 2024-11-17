import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Typography,
    Alert,
    Box
} from '@mui/material';
import { SmartToy as ModelIcon } from '@mui/icons-material';
import { getAvailableModels } from '../services/ollamaService';

interface ModelSelectorProps {
    open: boolean;
    onClose: () => void;
    onModelSelect: (model: string) => void;
}

interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ open, onClose, onModelSelect }) => {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadModels();
        }
    }, [open]);

    const loadModels = async () => {
        try {
            setLoading(true);
            setError(null);
            const availableModels = await getAvailableModels();
            setModels(availableModels);
        } catch (error) {
            setError('Failed to load models. Please make sure Ollama is running.');
            console.error('Error loading models:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModelSelect = (modelName: string) => {
        onModelSelect(modelName);
        onClose();
    };

    const formatSize = (bytes: number): string => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Select a Model</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : models.length === 0 ? (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        No models found. Please pull a model using the Ollama CLI first.
                    </Alert>
                ) : (
                    <List sx={{ pt: 0 }}>
                        {models.map((model) => (
                            <ListItem disableGutters key={model.digest}>
                                <ListItemButton onClick={() => handleModelSelect(model.name)}>
                                    <ListItemIcon>
                                        <ModelIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={model.name}
                                        secondary={`Size: ${formatSize(model.size)}`}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModelSelector;
