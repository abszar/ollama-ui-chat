/**
 * Configuration service for managing application settings
 * Handles storage and retrieval of user preferences from localStorage
 */

const CONFIG_KEY = 'ollama_config';

export type ThemeMode = 'light' | 'dark';

interface Config {
  baseUrl: string;  // Base URL for Ollama API
  theme: ThemeMode; // Application theme preference
}

const defaultConfig: Config = {
  baseUrl: 'http://localhost:11434',
  theme: 'dark'
};

export const configService = {
  /**
   * Retrieves the current configuration from localStorage
   * Falls back to default config if none exists or if there's an error
   */
  getConfig: (): Config => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      return stored ? JSON.parse(stored) : defaultConfig;
    } catch (error) {
      console.error('Error reading config:', error);
      return defaultConfig;
    }
  },

  /**
   * Saves the provided configuration to localStorage
   */
  setConfig: (config: Config): void => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  },

  /**
   * Gets the current Ollama API base URL
   */
  getBaseUrl: (): string => {
    return configService.getConfig().baseUrl;
  },

  /**
   * Updates the Ollama API base URL
   */
  setBaseUrl: (baseUrl: string): void => {
    const config = configService.getConfig();
    config.baseUrl = baseUrl;
    configService.setConfig(config);
  },

  /**
   * Gets the current theme preference
   */
  getTheme: (): ThemeMode => {
    return configService.getConfig().theme;
  },

  /**
   * Updates the theme preference
   */
  setTheme: (theme: ThemeMode): void => {
    const config = configService.getConfig();
    config.theme = theme;
    configService.setConfig(config);
  }
};
