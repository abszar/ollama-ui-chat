import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Typography,
    useTheme,
    Box,
} from '@mui/material';
import { SmartToy as ModelIcon } from '@mui/icons-material';
import { getAvailableModels } from '../services/ollamaService';

interface ModelSelectDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (model: string) => void;
}

export const ModelSelectDialog: React.FC<ModelSelectDialogProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const theme = useTheme();
    const [models, setModels] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            loadModels();
        }
    }, [open]);

    const loadModels = async () => {
        try {
            const availableModels = await getAvailableModels();
            setModels(availableModels.map(m => m.name));
        } catch (error) {
            console.error('Error loading models:', error);
            setModels([]);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: theme.palette.background.paper,
                }
            }}
        >
            <DialogTitle>Select a Model</DialogTitle>
            <DialogContent>
                {models.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2 }}>
                        No models available. Please install models from the Manage Modules section.
                    </Typography>
                ) : (
                    <List>
                        {models.map((model) => (
                            <ListItem key={model} disablePadding>
                                <ListItemButton 
                                    onClick={() => {
                                        onSelect(model);
                                        onClose();
                                    }}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&:hover': {
                                            backgroundColor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(0, 0, 0, 0.04)',
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <ModelIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={model}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontFamily: 'monospace',
                                                fontWeight: 500,
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};
