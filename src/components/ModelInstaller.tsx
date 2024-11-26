import React, { useState, useEffect } from 'react';
import { 
    installModel, 
    ModelPullProgress, 
    getLibraryModels, 
    getAvailableModels,
    deleteModel,
    cancelModelInstall,
    OllamaLibraryModel 
} from '../services/ollamaService';
import { 
    Box, 
    Button, 
    LinearProgress, 
    Typography, 
    Paper, 
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    CircularProgress,
    useTheme,
    TextField,
    Link,
    Divider,
    Alert,
    IconButton,
    Tooltip,
    Tab,
    Tabs
} from '@mui/material';
import { 
    Download as DownloadIcon,
    Launch as LaunchIcon,
    Delete as DeleteIcon,
    Stop as StopIcon
} from '@mui/icons-material';

interface ModelInstallerProps {
    onComplete: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const ModelInstaller: React.FC<ModelInstallerProps> = ({ onComplete }) => {
    const theme = useTheme();
    const [models, setModels] = useState<OllamaLibraryModel[]>([]);
    const [installedModels, setInstalledModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [progress, setProgress] = useState<ModelPullProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [customModelName, setCustomModelName] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const [libraryModels, available] = await Promise.all([
                getLibraryModels(),
                getAvailableModels()
            ]);
            setModels(libraryModels);
            setInstalledModels(available.map(m => m.name));
        } catch (err) {
            setError('Failed to load models');
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (modelName: string) => {
        setInstalling(modelName);
        setError(null);

        try {
            await installModel(modelName, (progress) => {
                setProgress(progress);
            });
            await loadModels();
            onComplete();
        } catch (err) {
            if (err instanceof Error && err.message === 'Installation cancelled') {
                setError('Installation cancelled');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to install model');
            }
        } finally {
            setInstalling(null);
            setProgress(null);
        }
    };

    const handleUninstall = async (modelName: string) => {
        try {
            await deleteModel(modelName);
            await loadModels();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to uninstall model');
        }
    };

    const handleCancel = () => {
        cancelModelInstall();
    };

    const handleCustomInstall = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customModelName.trim()) return;
        await handleInstall(customModelName.trim());
        setCustomModelName('');
    };

    const getProgressPercentage = () => {
        if (!progress?.total || !progress?.completed) return 0;
        return (progress.completed / progress.total) * 100;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Install Custom Model
                </Typography>
                <form onSubmit={handleCustomInstall}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter model name (e.g., llama2:13b)"
                            value={customModelName}
                            onChange={(e) => setCustomModelName(e.target.value)}
                            disabled={!!installing}
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={!customModelName.trim() || !!installing}
                            startIcon={<DownloadIcon />}
                        >
                            Install
                        </Button>
                    </Box>
                </form>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                        <Tab label="Available Models" />
                        <Tab label={`Installed Models (${installedModels.length})`} />
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            Popular Models
                        </Typography>
                        <Button
                            component={Link}
                            href="https://ollama.ai/library"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<LaunchIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Browse All Models
                        </Button>
                    </Box>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        This is a curated list of popular models. Visit the Ollama Library for the complete collection of available models.
                    </Alert>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <List sx={{ 
                        '& .MuiListItem-root': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            '&:last-child': {
                                borderBottom: 'none'
                            }
                        }
                    }}>
                        {models.map((model) => (
                            <ListItem key={model.name} sx={{ py: 2 }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle1" component="span">
                                                {model.name}
                                            </Typography>
                                            {model.tags?.map((tag) => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ 
                                                        height: '20px',
                                                        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
                                                        '& .MuiChip-label': {
                                                            fontSize: '0.7rem',
                                                            px: 1
                                                        }
                                                    }}
                                                />
                                            ))}
                                            {installedModels.includes(model.name) && (
                                                <Chip
                                                    label="Installed"
                                                    size="small"
                                                    color="success"
                                                    sx={{ 
                                                        height: '20px',
                                                        '& .MuiChip-label': {
                                                            fontSize: '0.7rem',
                                                            px: 1
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {model.description}
                                            </Typography>
                                            {model.size && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    Size: {model.size}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    {installing === model.name ? (
                                        <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                                    {progress?.status || 'Starting...'}
                                                </Typography>
                                                <LinearProgress 
                                                    variant={progress?.total ? "determinate" : "indeterminate"}
                                                    value={getProgressPercentage()}
                                                />
                                            </Box>
                                            <Tooltip title="Cancel Installation">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={handleCancel}
                                                    sx={{ color: theme.palette.error.main }}
                                                >
                                                    <StopIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ) : installedModels.includes(model.name) ? (
                                        <Tooltip title="Uninstall Model">
                                            <IconButton
                                                onClick={() => handleUninstall(model.name)}
                                                sx={{ 
                                                    color: theme.palette.error.main,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.error.main + '1A'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleInstall(model.name)}
                                            disabled={!!installing}
                                            sx={{ 
                                                borderColor: theme.palette.divider,
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            Install
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {installedModels.length === 0 ? (
                        <Alert severity="info">
                            No models installed yet. Install models from the Available Models tab.
                        </Alert>
                    ) : (
                        <List>
                            {installedModels.map((modelName) => (
                                <ListItem key={modelName}>
                                    <ListItemText primary={modelName} />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Uninstall Model">
                                            <IconButton
                                                onClick={() => handleUninstall(modelName)}
                                                sx={{ 
                                                    color: theme.palette.error.main,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.error.main + '1A'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </TabPanel>
            </Box>
        </Box>
    );
};
