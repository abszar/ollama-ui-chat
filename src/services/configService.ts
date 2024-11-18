const CONFIG_KEY = 'ollama_config';

export type ThemeMode = 'light' | 'dark';

interface Config {
  baseUrl: string;
  theme: ThemeMode;
}

const defaultConfig: Config = {
  baseUrl: 'http://localhost:11434',
  theme: 'dark'
};

export const configService = {
  getConfig: (): Config => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      return stored ? JSON.parse(stored) : defaultConfig;
    } catch (error) {
      console.error('Error reading config:', error);
      return defaultConfig;
    }
  },

  setConfig: (config: Config): void => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  },

  getBaseUrl: (): string => {
    return configService.getConfig().baseUrl;
  },

  setBaseUrl: (baseUrl: string): void => {
    const config = configService.getConfig();
    config.baseUrl = baseUrl;
    configService.setConfig(config);
  },

  getTheme: (): ThemeMode => {
    return configService.getConfig().theme;
  },

  setTheme: (theme: ThemeMode): void => {
    const config = configService.getConfig();
    config.theme = theme;
    configService.setConfig(config);
  }
};
