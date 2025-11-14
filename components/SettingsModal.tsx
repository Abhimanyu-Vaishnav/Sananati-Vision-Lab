
import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { AppSettings, AIProvider } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, saveSettings } = useContext(SettingsContext);
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        saveSettings(localSettings);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#FFF8E1] dark:bg-[#2a2216] rounded-xl shadow-2xl border border-amber-300 dark:border-amber-900/50 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-amber-900 dark:text-slate-200 mb-4">Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-amber-800 dark:text-slate-400 mb-1">
                            Your API Key
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            name="apiKey"
                            value={localSettings.apiKey}
                            onChange={handleInputChange}
                            placeholder="Enter your API key here"
                            className="w-full p-2 bg-white dark:bg-[#382d1f] border border-amber-300 dark:border-amber-700 rounded-md text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-1 focus:ring-[#F4C430] focus:border-[#F4C430] transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-amber-800 dark:text-slate-400 mb-1">
                            AI Provider
                        </label>
                        <select
                            id="provider"
                            name="provider"
                            value={localSettings.provider}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-white dark:bg-[#382d1f] border border-amber-300 dark:border-amber-700 rounded-md text-[#1C160C] dark:text-slate-200 focus:ring-1 focus:ring-[#F4C430] focus:border-[#F4C430] transition"
                        >
                            <option value={AIProvider.Gemini}>Google Gemini</option>
                            <option value={AIProvider.OpenAI} disabled>OpenAI (Coming Soon)</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-md text-amber-900 bg-amber-200/50 hover:bg-amber-200/80 dark:text-slate-300 dark:bg-amber-800/30 dark:hover:bg-amber-800/60 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm text-black transition ${isSaved ? 'bg-green-500' : 'bg-[#F4C430] hover:bg-[#EAA900]'}`}
                    >
                        {isSaved ? 'Saved!' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
