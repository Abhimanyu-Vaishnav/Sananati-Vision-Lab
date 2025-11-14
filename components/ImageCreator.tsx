
import React, { useState, useContext } from 'react';
import Spinner from './Spinner';
import ZoomableImage from './ZoomableImage';
import { generateImage } from '../services/geminiService';
import { SettingsContext } from '../contexts/SettingsContext';

const ImageCreator: React.FC = () => {
    const { settings } = useContext(SettingsContext);
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate an image.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            // FIX: Removed apiKey from the function call as it's now handled by environment variables.
            const generatedImageBase64 = await generateImage(prompt.trim(), settings.imageModel);
            setGeneratedImage(`data:image/png;base64,${generatedImageBase64}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 flex flex-col items-center">
            <div className="w-full max-w-2xl text-center">
                 <h3 className="text-xl font-semibold text-amber-900 dark:text-slate-300 mb-2">Describe the Image You Want to Create</h3>
                 <p className="text-amber-900/80 dark:text-slate-400 mb-4">Be as descriptive as possible for the best results. Think about the subject, style, colors, and mood.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A majestic elephant adorned with intricate golden patterns, walking through a serene temple garden at sunrise, in the style of a hyperrealistic painting.'"
                    className="w-full h-32 p-3 bg-white dark:bg-[#2a2216] border border-amber-300 dark:border-amber-800 rounded-lg text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#F4C430] focus:border-[#F4C430] transition"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="w-full max-w-xs inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-[#F4C430] hover:bg-[#EAA900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition"
            >
                {isLoading ? <Spinner /> : 'Create Image'}
            </button>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center max-w-2xl w-full">{error}</div>}

            {generatedImage && (
                 <div className="w-full max-w-2xl mt-4">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2 text-center">Your Creation</h3>
                    <ZoomableImage src={generatedImage} alt="Generated image based on prompt" />
                </div>
            )}
        </div>
    );
};

export default ImageCreator;