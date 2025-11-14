
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import ImageEditor from './components/ImageEditor';
import ImageAnalyzer from './components/ImageAnalyzer';
import TimeTravelBooth from './components/TimeTravelBooth';
import ImageCreator from './components/ImageCreator';
import { CreatorIcon, EditIcon, AnalyzeIcon, TimeTravelIcon, SunIcon, MoonIcon } from './components/icons';

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>(AppMode.Creator);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const renderContent = () => {
        switch (mode) {
            case AppMode.Creator:
                return <ImageCreator />;
            case AppMode.Editor:
                return <ImageEditor />;
            case AppMode.Analyzer:
                return <ImageAnalyzer />;
            case AppMode.TimeTravel:
                return <TimeTravelBooth />;
            default:
                return <ImageCreator />;
        }
    };

    const navItems = [
        { id: AppMode.Creator, label: 'Creator', icon: <CreatorIcon /> },
        { id: AppMode.Editor, label: 'Image Editor', icon: <EditIcon /> },
        { id: AppMode.Analyzer, label: 'Image Analyzer', icon: <AnalyzeIcon /> },
        { id: AppMode.TimeTravel, label: 'Time-Travel Booth', icon: <TimeTravelIcon /> },
    ];

    return (
        <div className="min-h-screen bg-[#FFF8E1] dark:bg-[#1C160C] text-[#1C160C] dark:text-white font-sans transition-colors duration-300">
            <div className="container mx-auto px-4 py-8">
                <header className="relative text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">
                        Sanatani Vision Lab
                    </h1>
                    <p className="mt-2 text-amber-900/80 dark:text-slate-400">Create, edit, and analyze images with the power of AI.</p>
                    <button onClick={toggleTheme} className="absolute top-0 right-0 p-2 rounded-full text-amber-600 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </header>

                <div className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-[#2a2216]/50 rounded-xl shadow-2xl border border-amber-300 dark:border-amber-900/50 backdrop-blur-sm">
                    <nav className="flex items-center p-2 border-b border-amber-300 dark:border-amber-800/50">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setMode(item.id)}
                                className={`flex-1 flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-colors ${
                                    mode === item.id 
                                    ? 'bg-[#F4C430] text-black shadow-md' 
                                    : 'text-amber-900/70 hover:bg-amber-100/50 dark:text-slate-300 dark:hover:bg-amber-800/20'
                                }`}
                            >
                                {item.icon}
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <main>
                        {renderContent()}
                    </main>
                </div>
                 <footer className="text-center mt-8 text-amber-900/60 dark:text-slate-500 text-sm">
                    <p>Powered by Sanatani AI. UI designed for clarity and function.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;