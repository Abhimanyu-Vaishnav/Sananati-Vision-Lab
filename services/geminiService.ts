
import { GoogleGenAI, Modality } from "@google/genai";

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

const getAi = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is not set. Please add it in Settings.");
    }
    return new GoogleGenAI({ apiKey });
}

export const generateImage = async (apiKey: string, prompt: string): Promise<string> => {
    try {
        const ai = getAi(apiKey);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error(`Failed to generate image. ${error instanceof Error ? error.message : ''}`);
    }
};

export const editImage = async (apiKey: string, base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAi(apiKey);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(`Failed to edit image. ${error instanceof Error ? error.message : ''}`);
    }
};

export const analyzeImage = async (apiKey: string, base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAi(apiKey);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ]
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error(`Failed to analyze image. ${error instanceof Error ? error.message : ''}`);
    }
};
