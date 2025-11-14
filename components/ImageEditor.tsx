
import React, { useState, useMemo, useContext } from 'react';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import ZoomableImage from './ZoomableImage';
import { fileToBase64, editImage } from '../services/geminiService';
import { SettingsContext } from '../contexts/SettingsContext';
import { UndoIcon, RedoIcon, CloseIcon } from './icons';

const QUICK_FILTERS = [
    { name: 'Grayscale', prompt: 'Convert the image to black and white grayscale.' },
    { name: 'Sepia', prompt: 'Apply a warm, brownish sepia tone to the image.' },
    { name: 'Vintage', prompt: 'Give the image a faded, vintage photograph look from the 1970s.' },
    { name: 'Cinematic', prompt: 'Apply a cinematic color grade with high contrast and teal and orange tones.' },
    { name: 'Vibrant', prompt: 'Enhance the colors to make them more vibrant and saturated.' },
    { name: 'Watercolor', prompt: 'Transform the image to look like a watercolor painting.' },
];


const ImageEditor: React.FC = () => {
    const { settings } = useContext(SettingsContext);
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // History state for undo/redo
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    // Fullscreen state
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    // Text overlay state
    const [enableTextOverlay, setEnableTextOverlay] = useState<boolean>(false);
    const [textOverlay, setTextOverlay] = useState<string>('');
    const [fontFamily, setFontFamily] = useState<string>('sans-serif');
    const [fontSize, setFontSize] = useState<string>('medium');
    const [fontColor, setFontColor] = useState<string>('white');
    const [textPosition, setTextPosition] = useState<string>('center');

    const originalImagePreview = useMemo(() => {
        return originalImage ? URL.createObjectURL(originalImage) : null;
    }, [originalImage]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleImageUpload = (file: File) => {
        setOriginalImage(file);
        setEditedImage(null);
        setHistory([]);
        setHistoryIndex(-1);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt.trim()) {
            setError('Please upload an image and provide an editing prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);

        let finalPrompt = prompt.trim();
        if (enableTextOverlay && textOverlay.trim()) {
            const textPromptPart = ` Also, add the text "${textOverlay.trim()}" at the ${textPosition.replace('-', ' ')} of the image. The text should be in a ${fontColor} color, with a ${fontSize} size, and a ${fontFamily} font style.`;
            finalPrompt += textPromptPart;
        }

        try {
            const base64Image = await fileToBase64(originalImage);
            const editedImageBase64 = await editImage(base64Image, originalImage.type, finalPrompt, settings.imageModel);
            const newImageSrc = `data:image/png;base64,${editedImageBase64}`;
            setEditedImage(newImageSrc);

            // Update history
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newImageSrc);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUndo = () => {
        if (canUndo) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setEditedImage(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (canRedo) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setEditedImage(history[newIndex]);
        }
    };

    const handleFilterClick = (filterPrompt: string) => {
        setPrompt(prev => prev ? `${prev.trim()} ${filterPrompt}` : filterPrompt);
    };
    
    const inputClasses = "w-full p-2 bg-white dark:bg-[#382d1f] border border-amber-300 dark:border-amber-700 rounded-md text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-1 focus:ring-[#F4C430] focus:border-[#F4C430] transition";

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader onImageUpload={handleImageUpload} imagePreviewUrl={originalImagePreview} title="1. Upload Original Image" />
                <div className="w-full space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">2. Describe Your Edit</h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Add a retro filter', 'Make the sky look like a sunset', 'Remove the person in the background'"
                            className="w-full h-28 p-3 bg-white dark:bg-[#2a2216] border border-amber-300 dark:border-amber-800 rounded-lg text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#F4C430] focus:border-[#F4C430] transition"
                        />
                    </div>
                    <div className="pt-2">
                        <h4 className="text-sm font-semibold text-amber-900/80 dark:text-slate-400 mb-2">Or apply a quick filter:</h4>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_FILTERS.map((filter) => (
                                <button
                                    key={filter.name}
                                    onClick={() => handleFilterClick(filter.prompt)}
                                    className="px-3 py-1 text-xs font-medium rounded-full transition bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-[#382d1f] dark:hover:bg-[#4a3c29] dark:text-slate-300"
                                >
                                    {filter.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2 border-t border-amber-200 dark:border-amber-800/50 pt-4">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={enableTextOverlay} onChange={(e) => setEnableTextOverlay(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#F4C430] focus:ring-[#F4C430] mr-3" />
                                3. Add Text Overlay (Optional)
                            </label>
                        </h3>
                        {enableTextOverlay && (
                            <div className="space-y-3 p-4 bg-amber-50 dark:bg-[#382d1f]/30 rounded-lg border border-amber-200 dark:border-amber-800/50 mt-2">
                                 <input type="text" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} placeholder="Text to add" className={inputClasses} />
                                 <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={fontColor} onChange={(e) => setFontColor(e.target.value)} placeholder="Color (e.g., white)" className={inputClasses} />
                                    <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className={inputClasses}>
                                        <option>small</option>
                                        <option>medium</option>
                                        <option>large</option>
                                        <option>extra large</option>
                                    </select>
                                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={inputClasses}>
                                        <option>sans-serif</option>
                                        <option>serif</option>
                                        <option>monospace</option>
                                        <option>cursive</option>
                                    </select>
                                    <select value={textPosition} onChange={(e) => setTextPosition(e.target.value)} className={inputClasses}>
                                        <option value="top-left">Top-Left</option>
                                        <option value="top-center">Top-Center</option>
                                        <option value="top-right">Top-Right</option>
                                        <option value="center">Center</option>
                                        <option value="bottom-left">Bottom-Left</option>
                                        <option value="bottom-center">Bottom-Center</option>
                                        <option value="bottom-right">Bottom-Right</option>
                                    </select>
                                 </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={handleUndo}
                            disabled={!canUndo || isLoading}
                            className="p-2 rounded-md shadow-sm text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-[#382d1f] dark:hover:bg-[#4a3c29] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            aria-label="Undo"
                        >
                           <UndoIcon />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo || isLoading}
                            className="p-2 rounded-md shadow-sm text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-[#382d1f] dark:hover:bg-[#4a3c29] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            aria-label="Redo"
                        >
                            <RedoIcon />
                        </button>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || !originalImage || !prompt}
                            className="flex-grow inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#F4C430] hover:bg-[#EAA900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? <Spinner /> : 'Generate Image'}
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

            {editedImage && originalImagePreview && (
                 <div className="w-full">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">Result</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-md font-medium text-center text-amber-900 dark:text-slate-400 mb-2">Original</h4>
                            <ZoomableImage src={originalImagePreview} alt="Original image" onFullscreen={setFullscreenImage} />
                        </div>
                        <div>
                             <h4 className="text-md font-medium text-center text-amber-900 dark:text-slate-400 mb-2">Edited</h4>
                            <ZoomableImage src={editedImage} alt="Edited result" onFullscreen={setFullscreenImage} />
                        </div>
                    </div>
                </div>
            )}
            {fullscreenImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-amber-300 transition"
                        onClick={() => setFullscreenImage(null)}
                        aria-label="Close fullscreen view"
                    >
                        <CloseIcon />
                    </button>
                    <img 
                        src={fullscreenImage} 
                        alt="Fullscreen view" 
                        className="max-w-[95vw] max-h-[95vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageEditor;
