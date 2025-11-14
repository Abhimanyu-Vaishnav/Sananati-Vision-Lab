import React, { useState, useMemo } from 'react';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import ZoomableImage from './ZoomableImage';
import { fileToBase64, editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleGenerate = async () => {
        if (!originalImage || !prompt.trim()) {
            setError('Please upload an image and provide an editing prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        let finalPrompt = prompt.trim();
        if (enableTextOverlay && textOverlay.trim()) {
            const textPromptPart = ` Also, add the text "${textOverlay.trim()}" at the ${textPosition.replace('-', ' ')} of the image. The text should be in a ${fontColor} color, with a ${fontSize} size, and a ${fontFamily} font style.`;
            finalPrompt += textPromptPart;
        }

        try {
            const base64Image = await fileToBase64(originalImage);
            const editedImageBase64 = await editImage(base64Image, originalImage.type, finalPrompt);
            setEditedImage(`data:image/png;base64,${editedImageBase64}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "w-full p-2 bg-white dark:bg-[#382d1f] border border-amber-300 dark:border-amber-700 rounded-md text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-1 focus:ring-[#F4C430] focus:border-[#F4C430] transition";

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader onImageUpload={setOriginalImage} imagePreviewUrl={originalImagePreview} title="1. Upload Original Image" />
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
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !originalImage || !prompt}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#F4C430] hover:bg-[#EAA900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? <Spinner /> : 'Generate Image'}
                    </button>
                </div>
            </div>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

            {editedImage && originalImagePreview && (
                 <div className="w-full">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">Result</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-md font-medium text-center text-amber-900 dark:text-slate-400 mb-2">Original</h4>
                            <ZoomableImage src={originalImagePreview} alt="Original image" />
                        </div>
                        <div>
                             <h4 className="text-md font-medium text-center text-amber-900 dark:text-slate-400 mb-2">Edited</h4>
                            <ZoomableImage src={editedImage} alt="Edited result" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageEditor;