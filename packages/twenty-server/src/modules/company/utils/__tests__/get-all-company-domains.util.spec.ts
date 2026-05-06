import { getAllCompanyDomains } from 'src/modules/company/utils/get-all-company-domains.util';

describe('getAllCompanyDomains', () => {
  it('returns empty when domainName is null/undefined', () => {
    expect(getAllCompanyDomains(null)).toEqual([]);
    expect(getAllCompanyDomains(undefined)).toEqual([]);
  });

  it('returns the primary domain only when no secondary links', () => {
    expect(
      getAllCompanyDomains({
        primaryLinkUrl: 'https://example.com',
        secondaryLinks: null,
      }),
    ).toEqual(['example.com']);
  });

  it('returns primary plus all secondary domains, deduplicated', () => {
    expect(
      getAllCompanyDomains({
        primaryLinkUrl: 'https://example.com',
        secondaryLinks: [
          { label: 'Alt', url: 'https://alt.com' },
          { label: 'Other', url: 'https://other.com' },
        ],
      }),
    ).toEqual(['example.com', 'alt.com', 'other.com']);
  });

  it('lowercases and strips www/protocol', () => {
    expect(
      getAllCompanyDomains({
        primaryLinkUrl: 'HTTPS://www.Example.COM/',
        secondaryLinks: [{ label: 'Alt', url: 'WWW.ALT.com/path' }],
      }),
    ).toEqual(['example.com', 'alt.com']);
  });

  it('skips empty/null URLs', () => {
    expect(
      getAllCompanyDomains({
        primaryLinkUrl: 'https://example.com',
        secondaryLinks: [
          { label: '', url: '' },
          { label: 'Alt', url: 'https://alt.com' },
        ],
      }),
    ).toEqual(['example.com', 'alt.com']);
  });

  it('deduplicates if the same domain appears in primary and secondary', () => {
    expect(
      getAllCompanyDomains({
        primaryLinkUrl: 'https://example.com',
        secondaryLinks: [
          { label: 'Same', url: 'https://www.example.com/' },
        ],
      }),
    ).toEqual(['example.com']);
  });

  it('treats different subdomains as distinct hosts', () => {
    expect(
      getAllCompanyDomains({
        primaryLinkUrl: 'https://example.com',
        secondaryLinks: [
          { label: 'News', url: 'https://news.example.com' },
        ],
      }),
    ).toEqual(['example.com', 'news.example.com']);
  });
});
