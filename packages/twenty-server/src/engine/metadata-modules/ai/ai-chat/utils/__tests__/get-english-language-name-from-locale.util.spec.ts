import { getEnglishLanguageNameFromLocale } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-english-language-name-from-locale.util';

describe('getEnglishLanguageNameFromLocale', () => {
  it.each([
    ['fr-FR', 'French'],
    ['de-DE', 'German'],
    ['ja-JP', 'Japanese'],
    ['zh-CN', 'Chinese'],
    ['en', 'English'],
  ])('should return %s as %s', (locale, expectedLanguageName) => {
    expect(getEnglishLanguageNameFromLocale(locale)).toBe(expectedLanguageName);
  });

  it('should return the locale itself when it is not a structurally valid language tag', () => {
    expect(getEnglishLanguageNameFromLocale('!')).toBe('!');
  });

  it('should return the language subtag when it has no display name', () => {
    expect(getEnglishLanguageNameFromLocale('xx-XX')).toBe('xx');
  });
});
