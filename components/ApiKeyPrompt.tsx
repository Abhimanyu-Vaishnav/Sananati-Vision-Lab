
import React from 'react';

interface ApiKeyPromptProps {
    onOpenSettings: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onOpenSettings }) => {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-white/30 dark:bg-[#1C160C]/30">
            <div className="bg-[#FFF8E1]/80 dark:bg-[#2a2216]/80 backdrop-blur-md p-6 rounded-lg shadow-lg border border-amber-300 dark:border-amber-800">
                <h3 className="text-xl font-bold text-amber-900 dark:text-slate-200">Welcome!</h3>
                <p className="mt-2 text-amber-800 dark:text-slate-400">
                    To begin creating, please add your API key in the settings panel.
                </p>
                <button
                    onClick={onOpenSettings}
                    className="mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#F4C430] hover:bg-[#EAA900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] transition"
                >
                    Go to Settings
                </button>
            </div>
        </div>
    );
};

export default ApiKeyPrompt;
