import { normalizePartner } from '@/utils/validation/normalizePartner';

describe('normalizePartner', () => {
  it('should trim and lowercase a valid partner', () => {
    expect(normalizePartner(' Acme ')).toBe('acme');
  });

  it('should accept letters, digits, hyphens and underscores', () => {
    expect(normalizePartner('acme-eu_2')).toBe('acme-eu_2');
  });

  it('should accept 1 and 64 characters', () => {
    expect(normalizePartner('a')).toBe('a');
    expect(normalizePartner('a'.repeat(64))).toBe('a'.repeat(64));
  });

  it('should reject more than 64 characters', () => {
    expect(normalizePartner('a'.repeat(65))).toBeUndefined();
  });

  it('should reject a value starting or ending with a separator', () => {
    expect(normalizePartner('-acme')).toBeUndefined();
    expect(normalizePartner('acme_')).toBeUndefined();
  });

  it('should reject other characters', () => {
    expect(normalizePartner('<x>')).toBeUndefined();
    expect(normalizePartner('acme.com')).toBeUndefined();
  });
});
