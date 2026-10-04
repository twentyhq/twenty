import { normalizeSearchText } from '../normalizeSearchText';

describe('normalizeSearchText', () => {
  it('lowercases without depending on the default locale', () => {
    expect(normalizeSearchText('United Kingdom')).toBe('united kingdom');
    expect(normalizeSearchText('India')).toBe('india');
    expect(normalizeSearchText('İtalya')).toBe('italya');
  });

  it('removes accents', () => {
    expect(normalizeSearchText("Côte d'Ivoire")).toBe("cote d'ivoire");
    expect(normalizeSearchText('Curaçao')).toBe('curacao');
    expect(normalizeSearchText('RÉUNION')).toBe('reunion');
    expect(normalizeSearchText('Türkiye')).toBe('turkiye');
    expect(normalizeSearchText('Åland Islands')).toBe('aland islands');
  });

  it('replaces letters that have no accent decomposition', () => {
    expect(normalizeSearchText('Øresund')).toBe('oresund');
    expect(normalizeSearchText('Æther')).toBe('aether');
    expect(normalizeSearchText('Straße')).toBe('strasse');
    expect(normalizeSearchText('Ðakovo')).toBe('dakovo');
    expect(normalizeSearchText('Þingvellir')).toBe('thingvellir');
    expect(normalizeSearchText('Łódź')).toBe('lodz');
    expect(normalizeSearchText('Œuvre')).toBe('oeuvre');
  });

  it('keeps whitespace, digits, and punctuation', () => {
    expect(normalizeSearchText(' France ')).toBe(' france ');
    expect(normalizeSearchText('+44')).toBe('+44');
  });
});
