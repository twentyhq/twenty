import { toIso639LanguageCode } from 'src/engine/metadata-modules/ai/ai-transcription/utils/to-iso-639-language-code.util';

describe('toIso639LanguageCode', () => {
  it.each([
    ['fr-FR', 'fr'],
    ['en', 'en'],
    ['pt-BR', 'pt'],
    ['ZH-Hans-CN', 'zh'],
  ])('reduces %s to %s', (languageTag, expected) => {
    expect(toIso639LanguageCode(languageTag)).toBe(expected);
  });
});
