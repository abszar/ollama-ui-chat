const CONFIG_KEY = 'ollama_config';

interface Config {
  baseUrl: string;
}

const defaultConfig: Config = {
  baseUrl: 'http://localhost:11434'
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
  }
};
