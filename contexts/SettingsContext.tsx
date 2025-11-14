
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, AIProvider } from '../types';

const SETTINGS_STORAGE_KEY = 'sanatani-vision-lab-settings';

const defaultSettings: AppSettings = {
    apiKey: '',
    provider: AIProvider.Gemini,
};

interface SettingsContextType {
    settings: AppSettings;
    saveSettings: (newSettings: AppSettings) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    saveSettings: () => {},
});

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                return JSON.parse(storedSettings);
            }
        } catch (error) {
            console.error('Error reading settings from localStorage', error);
        }
        return defaultSettings;
    });

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings to localStorage', error);
        }
    }, [settings]);

    const saveSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
