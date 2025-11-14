
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    imagePreviewUrl: string | null;
    title?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl, title = "Upload Image" }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageUpload(event.target.files[0]);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            onImageUpload(event.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">{title}</h3>
            <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-amber-400 dark:border-amber-800 border-dashed rounded-lg cursor-pointer bg-amber-100/50 dark:bg-[#2a2216] hover:bg-amber-100 dark:hover:bg-[#382d1f] transition-colors"
            >
                {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Preview" className="object-contain h-full w-full rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-amber-900/70 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-amber-900/60 dark:text-gray-500">PNG, JPG, or WEBP</p>
                    </div>
                )}
                <input ref={inputRef} id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div>
    );
};

export default ImageUploader;