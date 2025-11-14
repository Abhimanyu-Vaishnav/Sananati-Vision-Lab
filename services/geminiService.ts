
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

// FIX: Refactored to use process.env.API_KEY as per guidelines.
const getAi = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// FIX: Removed apiKey parameter to align with new getAi function.
export const generateImage = async (prompt: string, model: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
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

// FIX: Removed apiKey parameter to align with new getAi function.
export const editImage = async (base64Image: string, mimeType: string, prompt: string, model: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
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
    // FIX: Added curly braces to the catch block to fix syntax error and scope issues.
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(`Failed to edit image. ${error instanceof Error ? error.message : ''}`);
    }
};

// FIX: Removed apiKey parameter to align with new getAi function.
export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string, model: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model,
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