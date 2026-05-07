import {
  isInstitutionalDomain,
  isInstitutionalEmail,
} from 'src/utils/is-institutional-email';

describe('isInstitutionalDomain', () => {
  it('returns true for universities in the Hipolabs dataset', () => {
    expect(isInstitutionalDomain('mit.edu')).toBe(true);
    expect(isInstitutionalDomain('cam.ac.uk')).toBe(true);
    expect(isInstitutionalDomain('ethz.ch')).toBe(true);
  });

  it('returns true for one-level subdomains under a known university', () => {
    expect(isInstitutionalDomain('stud.tu-darmstadt.de')).toBe(true);
    expect(isInstitutionalDomain('cs.stanford.edu')).toBe(true);
    expect(isInstitutionalDomain('alumni.mit.edu')).toBe(true);
  });

  it('returns false for company-owned domains', () => {
    expect(isInstitutionalDomain('acme.com')).toBe(false);
    expect(isInstitutionalDomain('example.io')).toBe(false);
  });

  it('does not match bare TLDs via parent walk', () => {
    expect(isInstitutionalDomain('de')).toBe(false);
    expect(isInstitutionalDomain('edu')).toBe(false);
    expect(isInstitutionalDomain('random.de')).toBe(false);
  });

  it('does not treat consumer providers as institutional', () => {
    expect(isInstitutionalDomain('gmail.com')).toBe(false);
    expect(isInstitutionalDomain('outlook.com')).toBe(false);
  });
});

describe('isInstitutionalEmail', () => {
  it('extracts the domain and applies the institutional rules', () => {
    expect(isInstitutionalEmail('researcher@mit.edu')).toBe(true);
    expect(isInstitutionalEmail('student@stud.tu-darmstadt.de')).toBe(true);
    expect(isInstitutionalEmail('user@acme.com')).toBe(false);
  });

  it('returns false rather than throwing on malformed input', () => {
    expect(isInstitutionalEmail('')).toBe(false);
    expect(isInstitutionalEmail('not-an-email')).toBe(false);
    expect(isInstitutionalEmail('missing-domain@')).toBe(false);
  });
});
