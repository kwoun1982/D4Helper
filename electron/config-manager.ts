import Store from 'electron-store';
import { AppConfig, DEFAULT_CONFIG } from '../src/types';

const store = new Store<{ config: AppConfig }>({
  defaults: { config: DEFAULT_CONFIG },
});

// In-memory cache of the current configuration
export let currentConfig: AppConfig = store.get('config');

export function getConfig(): AppConfig {
  currentConfig = store.get('config');
  return currentConfig;
}

export function saveConfig(newConfig: AppConfig): boolean {
  try {
    store.set('config', newConfig);
    currentConfig = newConfig;
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
}

export function reloadConfig(): AppConfig {
  currentConfig = store.get('config');
  return currentConfig;
}
