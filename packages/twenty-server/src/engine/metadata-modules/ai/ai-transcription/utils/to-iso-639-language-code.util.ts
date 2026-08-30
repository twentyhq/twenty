// Transcription providers take ISO-639-1 ("fr"), while the app stores BCP-47
// locales ("fr-FR"), so the region subtag is dropped.
export const toIso639LanguageCode = (languageTag: string): string =>
  languageTag.split('-')[0].toLowerCase();
