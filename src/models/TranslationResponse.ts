export interface TranslationResponse {
  detectedLanguage: DetectedLanguage;
  translations: ApiTranslation[];
}
export interface ApiTranslation {
  text: string;
  to: string;
}
export interface DetectedLanguage {
  language: string;
  score: number;
}
