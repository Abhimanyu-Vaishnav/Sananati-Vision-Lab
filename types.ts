
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

export interface AppSettings {
  apiKey: string;
  provider: AIProvider;
}
