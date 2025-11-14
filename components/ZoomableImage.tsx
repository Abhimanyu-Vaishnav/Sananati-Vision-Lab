
import React, { useState, useRef, MouseEvent } from 'react';
import { ZoomInIcon, ZoomOutIcon, ResetIcon, DownloadIcon, FullscreenIcon } from './icons';

interface ZoomableImageProps {
    src: string;
    alt: string;
    onFullscreen?: (src: string) => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, onFullscreen }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
        if (zoom > 1) {
            e.preventDefault();
            setIsDragging(true);
            setStartPos({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
            if (imageRef.current) {
                imageRef.current.style.cursor = 'grabbing';
            }
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
        if (isDragging && zoom > 1) {
            e.preventDefault();
            const newX = e.clientX - startPos.x;
            const newY = e.clientY - startPos.y;
            setPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUpOrLeave = (e: MouseEvent<HTMLImageElement>) => {
        if (isDragging) {
            e.preventDefault();
            setIsDragging(false);
            if (imageRef.current) {
                imageRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
            }
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };
    
    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
    const handleZoomOut = () => {
        const newZoom = Math.max(zoom / 1.2, 1);
        if (newZoom === 1) {
            handleReset();
        } else {
            setZoom(newZoom);
        }
    };
    
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        const fileName = alt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${fileName || 'download'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div 
            className="relative w-full h-auto bg-amber-50 dark:bg-[#2a2216] border-2 border-amber-300 dark:border-amber-800 border-dashed rounded-lg p-2 overflow-hidden select-none"
            onWheel={handleWheel}
        >
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                className="object-contain w-full h-full transition-transform duration-100 ease-linear"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    cursor: zoom > 1 ? 'grab' : 'default',
                    maxHeight: '60vh',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                draggable="false"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                <button onClick={handleZoomIn} className="p-1.5 text-white hover:bg-white/20 rounded-full transition" aria-label="Zoom In"><ZoomInIcon /></button>
                <button onClick={handleZoomOut} className="p-1.5 text-white hover:bg-white/20 rounded-full transition" aria-label="Zoom Out"><ZoomOutIcon /></button>
                <button onClick={handleReset} className="p-1.5 text-white hover:bg-white/20 rounded-full transition" aria-label="Reset Zoom"><ResetIcon /></button>
                <div className="w-px h-5 bg-white/30 mx-1"></div>
                {onFullscreen && (
                    <button onClick={() => onFullscreen(src)} className="p-1.5 text-white hover:bg-white/20 rounded-full transition" aria-label="Fullscreen"><FullscreenIcon /></button>
                )}
                <button onClick={handleDownload} className="p-1.5 text-white hover:bg-white/20 rounded-full transition" aria-label="Download Image"><DownloadIcon /></button>
            </div>
        </div>
    );
};

export default ZoomableImage;
