
export enum AppMode {
  Creator = 'Creator',
  Editor = 'Editor',
  Analyzer = 'Analyzer',
  TimeTravel = 'TimeTravel',
}

export enum AIProvider {
  Gemini = 'Gemini',
  OpenAI = 'OpenAI', // For future expansion
}

export const ImageModels: Record<string, string> = {
    'gemini-2.5-flash-image': 'Gemini 2.5 Flash Image (Fast, General Use)',
};

export const TextModels: Record<string, string> = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash (Fast, General Use)',
    'gemini-2.5-pro': 'Gemini 2.5 Pro (Advanced, Complex Tasks)',
};

export interface AppSettings {
  // FIX: Removed apiKey to adhere to security guidelines. API key should be handled by environment variables.
  provider: AIProvider;
  imageModel: string;
  textModel: string;
}