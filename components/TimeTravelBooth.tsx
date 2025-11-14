import React, { useState, useMemo, useContext } from 'react';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';
import ZoomableImage from './ZoomableImage';
import { fileToBase64, editImage } from '../services/geminiService';
import { SettingsContext } from '../contexts/SettingsContext';

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
    "Participating in the Kumbh Mela at Prayagraj",
    "Watching a Kathakali performance in a Kerala temple",
    "A scholarly debate in the court of Emperor Akbar",
    "In the audience for a sermon by Adi Shankaracharya",
    "Exploring the rock-cut caves of Ajanta and Ellora",
    "Witnessing the construction of the Taj Mahal",
    "A philosophical discourse with sages in the Himalayas",
    "Sailing with ancient Indian mariners to Southeast Asia",
    "Attending a grand feast in a Rajput fort in Chittorgarh",
    "Learning martial arts at a Kalaripayattu school",
    "Presenting a poem in the court of Krishnadevaraya",
    "A traditional wedding ceremony during the Mauryan period",
    "Forging Wootz steel in a South Indian workshop",
    "Trading pearls in the ancient port of Muziris",
    "A procession during the Ratha Yatra in Puri",
    "Listening to Tansen perform for Emperor Akbar",
    "Debating philosophy at the ancient university of Taxila",
    "Celebrating Pongal in a rural Tamil village",
    "A prayer session at the Meenakshi Temple in Madurai",
    "Joining a merchant caravan on the Grand Trunk Road",
    "Witnessing the coronation of Samudragupta",
    "At the Iron Pillar of Delhi when it was first erected",
    "A Durga Puja celebration in ancient Bengal",
    "Exploring the magnificent ruins of Hampi",
    "A quiet evening on the spiritual ghats of Varanasi",
    "Participating in a Soma ritual in the Vedic period",
    "A summit meeting between Maratha sardars",
    "Crafting intricate jewelry in ancient Jaipur",
    "A theatrical performance of a Kalidasa play",
    "Witnessing the churning of the ocean (Samudra manthan)",
    "At the celestial wedding of Shiva and Parvati in the Himalayas",
    "In the divine court of Indra in Svarga",
    "Flying in a Vimana over ancient Lanka",
    "In the hermitage of Rishi Kanva with Shakuntala",
    "Helping build the Ram Setu bridge to Lanka",
    "A secret meeting with Chanakya to discuss statecraft",
    "A grand durbar in the opulent Mysore Palace",
    "Observing the night sky with astronomer Aryabhata",
    "A village panchayat meeting under a large banyan tree",
    "Watching a traditional puppet show (Kathputli) in Rajasthan",
    "Celebrating Ganesh Chaturthi with a grand procession in Maharashtra",
    "On a strenuous pilgrimage to the Badrinath temple",
    "At the court of King Harsha of Kannauj",
    "Trading cotton textiles in the Indus Valley port city of Lothal",
    "A Sufi gathering with qawwali music at a Delhi dargah",
    "Witnessing the historic Battle of Plassey",
    "A gathering of Bhakti poets like Kabir or Mirabai",
    "The inauguration ceremony of the Brihadeeswarar Temple in Thanjavur",
    "A quiet monastery in the mountains of Ladakh",
    "Inside the vibrant court of the Satavahana dynasty",
    "Celebrating Onam with a grand feast in Kerala",
    "Witnessing a Jallikattu event in ancient Tamil Nadu",
    "In the library of the Vikramshila University",
    "A naval expedition of the Chola dynasty",
    "Exploring the ancient city of Pataliputra",
    "A classical music concert in the city of Tanjore",
    "In the midst of the Indian Rebellion of 1857",
    "Attending the court of the Sikh Emperor Ranjit Singh",
    "Celebrating the festival of Baisakhi in Punjab",
    "A diplomatic meeting with Greek ambassadors in the Mauryan court",
    "Exploring the architectural marvels of Fatehpur Sikri",
    "A monsoon evening in a Malabar coastal village",
    "Witnessing a traditional Theyyam ritual in Kerala",
    "In the lush gardens of Shalimar Bagh in Kashmir",
    "A polo match in ancient Manipur",
];

const TimeTravelBooth: React.FC = () => {
    const { settings } = useContext(SettingsContext);
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
            // FIX: Removed apiKey from the function call as it's now handled by environment variables.
            const resultBase64 = await editImage(base64Image, userImage.type, prompt, settings.imageModel);
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
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 modern-scrollbar">
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