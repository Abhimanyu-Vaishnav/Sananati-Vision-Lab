
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, AIProvider } from '../types';

const SETTINGS_STORAGE_KEY = 'sanatani-vision-lab-settings';

// FIX: Removed apiKey from default settings as it's now handled by environment variables.
const defaultSettings: AppSettings = {
    provider: AIProvider.Gemini,
    imageModel: 'gemini-2.5-flash-image',
    textModel: 'gemini-2.5-flash',
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
                // Merge stored settings with defaults to handle new fields gracefully
                return { ...defaultSettings, ...JSON.parse(storedSettings) };
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