import { getSubdomainSlugFromDisplayName } from '@/utils/subdomain/getSubdomainSlugFromDisplayName';

describe('getSubdomainSlugFromDisplayName', () => {
  it('should slugify a multi-word name', () => {
    expect(getSubdomainSlugFromDisplayName('My Display Name 123')).toBe(
      'my-display-name-123',
    );
  });

  it('should collapse special characters and spaces into single hyphens', () => {
    expect(getSubdomainSlugFromDisplayName('Hello!@# World$%^ 2023')).toBe(
      'hello-world-2023',
    );
  });

  it('should lowercase a single word', () => {
    expect(getSubdomainSlugFromDisplayName('SingleWord')).toBe('singleword');
  });

  it('should trim leading and trailing whitespace and hyphens', () => {
    expect(getSubdomainSlugFromDisplayName('   Spaced   Out    Name   ')).toBe(
      'spaced-out-name',
    );
  });

  it('should strip diacritics from accented characters', () => {
    expect(getSubdomainSlugFromDisplayName('Café Münchën Inc.')).toBe(
      'cafe-munchen-inc',
    );
  });

  it('should return undefined for undefined input', () => {
    expect(getSubdomainSlugFromDisplayName(undefined)).toBeUndefined();
  });

  it('should return undefined when nothing usable remains', () => {
    expect(getSubdomainSlugFromDisplayName('!@#$%^&*()')).toBeUndefined();
  });

  it('should transliterate non-latin scripts', () => {
    expect(getSubdomainSlugFromDisplayName('日本語')).toBe('ri-ben-yu');
  });

  it('should return undefined when the result is shorter than the minimum length', () => {
    expect(getSubdomainSlugFromDisplayName('AB')).toBeUndefined();
  });

  it('should clamp long names to the maximum length without a trailing hyphen', () => {
    const result = getSubdomainSlugFromDisplayName(
      'Acme Corporation International Holdings Group',
    );

    expect(result).toBe('acme-corporation-international');
    expect(result?.length).toBeLessThanOrEqual(30);
    expect(result?.endsWith('-')).toBe(false);
  });
});
