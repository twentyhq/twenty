import { stripAccents } from '@/utils/filter/utils/stripAccents';

describe('stripAccents', () => {
  it('should return non-string inputs as-is', () => {
    expect(stripAccents(undefined as unknown as string)).toBeUndefined();
    expect(stripAccents(null as unknown as string)).toBeNull();
    expect(stripAccents(123 as unknown as string)).toBe(123);
  });

  it('should strip standard Latin diacritical accents', () => {
    expect(stripAccents('Café')).toBe('Cafe');
    expect(stripAccents('résumé')).toBe('resume');
    expect(stripAccents('München')).toBe('Munchen');
    expect(stripAccents('español')).toBe('espanol');
  });

  it('should strip Polish stroke and accented characters', () => {
    expect(stripAccents('Łódź')).toBe('Lodz');
    expect(stripAccents('łódź')).toBe('lodz');
    expect(stripAccents('Kraków')).toBe('Krakow');
    expect(stripAccents('Gdańsk')).toBe('Gdansk');
  });

  it('should strip Scandinavian special characters and strokes', () => {
    expect(stripAccents('København')).toBe('Kobenhavn');
    expect(stripAccents('københavn')).toBe('kobenhavn');
    expect(stripAccents('Tromsø')).toBe('Tromso');
    expect(stripAccents('Ærøskøbing')).toBe('AEroskobing');
    expect(stripAccents('ærøskøbing')).toBe('aeroskobing');
  });

  it('should strip German sharp s and umlauts', () => {
    expect(stripAccents('Straße')).toBe('Strasse');
    expect(stripAccents('STRAßE')).toBe('STRAsse');
    expect(stripAccents('Groß')).toBe('Gross');
  });

  it('should strip French ligatures', () => {
    expect(stripAccents('Cœur')).toBe('Coeur');
    expect(stripAccents('Œuvre')).toBe('OEuvre');
    expect(stripAccents('cœur')).toBe('coeur');
    expect(stripAccents('œil')).toBe('oeil');
  });

  it('should strip Vietnamese and Slavic strokes', () => {
    expect(stripAccents('Đà Nẵng')).toBe('Da Nang');
    expect(stripAccents('đà nẵng')).toBe('da nang');
    expect(stripAccents('Đồng Nai')).toBe('Dong Nai');
  });

  it('should strip Icelandic thorn and eth', () => {
    expect(stripAccents('Þingvellir')).toBe('THingvellir');
    expect(stripAccents('þingvellir')).toBe('thingvellir');
    expect(stripAccents('Hafnarfjörður')).toBe('Hafnarfjordur');
  });

  it('should strip Maltese H with stroke', () => {
    expect(stripAccents('Ħamrun')).toBe('Hamrun');
    expect(stripAccents('ħamrun')).toBe('hamrun');
  });
});
