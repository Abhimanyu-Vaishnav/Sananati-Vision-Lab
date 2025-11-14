import React, { useState, useMemo } from 'react';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import ZoomableImage from './ZoomableImage';
import { fileToBase64, editImage } from '../services/geminiService';

const SCENES = [
    "A Vedic-era Gurukul",
    "The court of Emperor Ashoka",
    "A bustling bazaar in the Gupta Empire",
    "Carving deities at a Chola temple",
    "A scene from the Ramayana",
    "A vibrant Holi festival in Mathura",
    "Meditating under the Bodhi tree",
    "On the battlefield of Kurukshetra",
    "Celebrating Diwali in ancient Ayodhya",
    "A royal procession in the Mughal court",
    "Trading spices on the ancient Silk Road",
    "At a concert in a Maharaja's palace",
    "Walking the streets of Mohenjo-Daro",
    "In the grand court of Shivaji Maharaj",
    "Studying astronomy at Nalanda University",
    "Witnessing the splendor of the Vijayanagara Empire",
    "At the serene Golden Temple in Amritsar",
];

const TimeTravelBooth: React.FC = () => {
    const [userImage, setUserImage] = useState<File | null>(null);
    const [selectedScene, setSelectedScene] = useState<string>(SCENES[0]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const userImagePreview = useMemo(() => {
        return userImage ? URL.createObjectURL(userImage) : null;
    }, [userImage]);

    const filteredScenes = useMemo(() =>
        SCENES.filter(scene =>
            scene.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [searchQuery]
    );

    const handleGenerate = async () => {
        if (!userImage) {
            setError('Please upload a photo of yourself.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        const prompt = `Take the person in this photo and place them in a realistic scene from ${selectedScene}. The style should be like a photograph from that era. Ensure their clothing, hairstyle, and the background are historically accurate and seamlessly blended.`;

        try {
            const base64Image = await fileToBase64(userImage);
            const resultBase64 = await editImage(base64Image, userImage.type, prompt);
            setGeneratedImage(`data:image/png;base64,${resultBase64}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <ImageUploader onImageUpload={setUserImage} imagePreviewUrl={userImagePreview} title="1. Upload Your Photo" />
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">2. Select a Destination</h3>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search destinations..."
                        className="w-full p-2 bg-white dark:bg-[#2a2216] border border-amber-300 dark:border-amber-800 rounded-lg text-[#1C160C] dark:text-slate-200 placeholder-amber-900/50 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#F4C430] focus:border-[#F4C430] transition"
                    />
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                         {filteredScenes.length > 0 ? (
                            filteredScenes.map((scene) => (
                                <button
                                    key={scene}
                                    onClick={() => setSelectedScene(scene)}
                                    className={`p-3 text-sm font-medium rounded-lg transition text-left ${selectedScene === scene ? 'bg-[#F4C430] text-black ring-2 ring-[#EAA900]' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-[#2a2216] dark:hover:bg-[#382d1f] dark:text-slate-300'}`}
                                >
                                    {scene}
                                </button>
                            ))
                        ) : (
                             <p className="col-span-2 text-center text-amber-900/70 dark:text-gray-400 p-4">No destinations found.</p>
                        )}
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !userImage}
                        className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-[#F4C430] hover:bg-[#EAA900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-[#1C160C] focus:ring-[#F4C430] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? <Spinner /> : 'Time Travel!'}
                    </button>
                </div>
            </div>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}
            
            {generatedImage && userImagePreview && (
                 <div className="w-full">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-slate-300 mb-2">Your Trip Souvenir</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-md font-medium text-center text-amber-900 dark:text-slate-400 mb-2">You</h4>
                            <ZoomableImage src={userImagePreview} alt="Original photo" />
                        </div>
                        <div>
                             <h4 className="text-md font-medium text-center text-amber-900 dark:text-slate-400 mb-2">Your Journey</h4>
                            <ZoomableImage src={generatedImage} alt="Time travel result" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeTravelBooth;