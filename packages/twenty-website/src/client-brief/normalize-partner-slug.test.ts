import { normalizePartnerSlug } from './normalize-partner-slug';

describe('normalizePartnerSlug', () => {
  it('returns a well-formed slug unchanged', () => {
    expect(normalizePartnerSlug('acme-consulting')).toBe('acme-consulting');
  });

  it('returns undefined when the param is absent', () => {
    expect(normalizePartnerSlug(undefined)).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(normalizePartnerSlug('')).toBeUndefined();
  });

  it('drops a slug with unsupported characters instead of forwarding it', () => {
    expect(normalizePartnerSlug('Acme Consulting!')).toBeUndefined();
  });

  it('drops an over-long slug', () => {
    expect(normalizePartnerSlug('a'.repeat(101))).toBeUndefined();
  });

  it('takes the first value when the param is repeated', () => {
    expect(normalizePartnerSlug(['acme-consulting', 'other'])).toBe(
      'acme-consulting',
    );
  });
});
