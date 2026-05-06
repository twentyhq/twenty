import {
  isPersonalOrInstitutionalDomain,
  isPersonalOrInstitutionalEmail,
} from 'src/utils/is-personal-or-institutional-email';

describe('isPersonalOrInstitutionalDomain', () => {
  it('returns true for consumer email providers', () => {
    expect(isPersonalOrInstitutionalDomain('gmail.com')).toBe(true);
    expect(isPersonalOrInstitutionalDomain('outlook.com')).toBe(true);
  });

  it('returns true for universities present in the Hipolabs dataset', () => {
    // Domains where many unrelated members share an address space.
    expect(isPersonalOrInstitutionalDomain('mit.edu')).toBe(true);
    expect(isPersonalOrInstitutionalDomain('cam.ac.uk')).toBe(true);
    expect(isPersonalOrInstitutionalDomain('ethz.ch')).toBe(true);
  });

  it('returns false for company-owned domains', () => {
    expect(isPersonalOrInstitutionalDomain('acme.com')).toBe(false);
    expect(isPersonalOrInstitutionalDomain('example.io')).toBe(false);
  });
});

describe('isPersonalOrInstitutionalEmail', () => {
  it('extracts the domain and applies the same rules as the domain check', () => {
    expect(isPersonalOrInstitutionalEmail('user@gmail.com')).toBe(true);
    expect(isPersonalOrInstitutionalEmail('researcher@mit.edu')).toBe(true);
    expect(isPersonalOrInstitutionalEmail('user@acme.com')).toBe(false);
  });

  it('returns false rather than throwing on malformed input', () => {
    // Callers (filter-emails gate, contact filter) treat false as
    // "domain looks org-defining" — failing closed is the safe default.
    expect(isPersonalOrInstitutionalEmail('')).toBe(false);
    expect(isPersonalOrInstitutionalEmail('not-an-email')).toBe(false);
    expect(isPersonalOrInstitutionalEmail('missing-domain@')).toBe(false);
  });
});
