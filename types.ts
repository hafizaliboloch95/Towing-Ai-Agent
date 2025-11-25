export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[]
    }
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum DispatchMode {
  STANDARD = 'STANDARD', // Gemini 2.5 Flash + Tools (Search/Maps)
  COMPLEX = 'COMPLEX',   // Gemini 3.0 Pro + Thinking
}
