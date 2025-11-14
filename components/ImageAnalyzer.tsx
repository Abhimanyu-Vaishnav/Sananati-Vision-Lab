
import React, { useState, useMemo, useContext } from 'react';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import { fileToBase64, analyzeImage } from '../services/geminiService';
import { SettingsContext } from '../contexts/SettingsContext';

interface AnalysisHistoryEntry {
    id: number;
    imageFile: File;
    imagePreviewUrl: string;
    prompt: string;
    analysis: string;
}

const ImageAnalyzer: React.FC = () => {
    const { settings } = useContext(SettingsContext);
    const [image, setImage] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('Describe this image in detail.');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryEntry[]>([]);

    const imagePreview = useMemo(() => {
        return image ? URL.createObjectURL(image) : null;
    }, [image]);

    // Core analysis function
    const runAnalysis = async (imageToAnalyze: File, promptToUse: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const base64Image = await fileToBase64(imageToAnalyze);
            // FIX: Removed apiKey from the function call as it's now handled by environment variables.
            const result = await analyzeImage(base64Image, imageToAnalyze.type, promptToUse, settings.textModel);
            setAnalysis(result);

            const newEntry: AnalysisHistoryEntry = {
                id: Date.now(),
                imageFile: imageToAnalyze,
                imagePreviewUrl: URL.createObjectURL(imageToAnalyze),
                prompt: promptToUse,
                analysis: result,
            };
            setAnalysisHistory(prev => [newEntry, ...prev].slice(0, 10)); // Prepend and limit to 10

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setAnalysis(null); // Ensure analysis is cleared on error
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handler for the main button
    const handleAnalyze = () => {
        if (image) {
            runAnalysis(image, prompt);
        } else {
            setError('Please upload an image to analyze.');
        }
    };

    // Handler for viewing a history item
    const handleViewHistory = (entry: AnalysisHistoryEntry) => {
        setImage(entry.imageFile);
        setPrompt(entry.prompt);
        setAnalysis(entry.analysis);
    };

    // Handler for re-running a history item
    const handleRerunHistory = (entry: AnalysisHistoryEntry) => {
        setImage(entry.imageFile);
        setPrompt(entry.prompt);
        runAnalysis(entry.imageFile, entry.prompt);
    };

    const handleClearHistory = () => {
        setAnalysisHistory([]);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <ImageUploader onImageUpload={setImage} imagePreviewUrl={imagePreview} title="1. Upload Image to Analyze" />
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">2. Analysis Prompt (optional)</h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'What is the main subject of this photo?', 'Identify any text in this image.'"
                            className="w-full h-24 p-3 bg-white dark:bg-[#2a2216] border border-amber-300 dark:border-amber-800 rounded-lg text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#F4C430] focus:border-[#F4C430] transition"
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !image}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#F4C430] hover:bg-[#EAA900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? <Spinner /> : 'Analyze Image'}
                    </button>
                </div>
            </div>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

            {analysis && (
                <div>
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">Analysis Result</h3>
                    <div className="p-4 bg-amber-50 dark:bg-[#2a2216] border border-amber-300 dark:border-amber-800 rounded-lg text-amber-950 dark:text-slate-300 whitespace-pre-wrap">
                        {analysis}
                    </div>
                </div>
            )}

            {analysisHistory.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300">Analysis History</h3>
                        <button 
                          onClick={handleClearHistory}
                          className="text-sm text-amber-700 dark:text-amber-500 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                        >
                            Clear History
                        </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto p-2 border-t border-amber-300 dark:border-amber-800">
                        {analysisHistory.map(entry => (
                            <div key={entry.id} className="p-3 bg-amber-50/70 dark:bg-[#2a2216]/80 border border-amber-300/50 dark:border-amber-800/60 rounded-lg flex items-start gap-4">
                                <img src={entry.imagePreviewUrl} alt="History thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold text-amber-950 dark:text-slate-300 truncate">Prompt: <span className="font-normal">{entry.prompt}</span></p>
                                    <p className="text-sm text-amber-900/80 dark:text-slate-400 mt-1 truncate">
                                        {entry.analysis}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleViewHistory(entry)} className="px-2 py-1 text-xs font-medium rounded-md bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-800/50 dark:text-amber-300 dark:hover:bg-amber-800/80 transition">
                                            View
                                        </button>
                                        <button onClick={() => handleRerunHistory(entry)} className="px-2 py-1 text-xs font-medium rounded-md bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-800/50 dark:text-amber-300 dark:hover:bg-amber-800/80 transition">
                                            Re-run
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageAnalyzer;