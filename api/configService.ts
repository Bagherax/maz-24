import type { CloudConfig } from '../types';
import { CLOUD_CONFIG_KEY, simulateDelay } from './mockData';

export const getCloudConfig = async (): Promise<CloudConfig | null> => {
    await simulateDelay(150);
    const configJson = localStorage.getItem(CLOUD_CONFIG_KEY);
    return configJson ? JSON.parse(configJson) : null;
};

export const saveCloudConfig = async (config: CloudConfig): Promise<void> => {
    await simulateDelay(700);
    if (!config.serverUrl || !config.username || !config.password) {
        throw new Error("Invalid configuration. All fields are required.");
    }
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
};

export const deleteCloudConfig = async (): Promise<void> => {
    await simulateDelay(200);
    localStorage.removeItem(CLOUD_CONFIG_KEY);
};
