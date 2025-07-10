import { lowercaseUrlRemoveTrailingSlashAndAddHttps } from '@/utils';

describe('lowercaseUrlRemoveTrailingSlashAndAddHttps', () => {
  it('should leave lowcased domain unchanged', () => {
    const primaryLinkUrl = 'https://www.example.com/test';
    const result = lowercaseUrlRemoveTrailingSlashAndAddHttps(primaryLinkUrl);

    expect(result).toBe('https://www.example.com/test');
  });

  it('should lowercase the domain of the primary link url', () => {
    const primaryLinkUrl = 'htTps://wwW.exAmple.coM/TEST';
    const result = lowercaseUrlRemoveTrailingSlashAndAddHttps(primaryLinkUrl);

    expect(result).toBe('https://www.example.com/test');
  });

  it('should not add a trailing slash', () => {
    const primaryLinkUrl = 'https://www.example.com';
    const result = lowercaseUrlRemoveTrailingSlashAndAddHttps(primaryLinkUrl);

    expect(result).toBe('https://www.example.com');
  });

  it('should add https:// if no protocol is present', () => {
    const primaryLinkUrl = 'www.example.com';
    const result = lowercaseUrlRemoveTrailingSlashAndAddHttps(primaryLinkUrl);

    expect(result).toBe('https://www.example.com');
  });

  it('should not add https:// if protocol is present', () => {
    const primaryLinkUrl = 'ftp://example.com';
    const result = lowercaseUrlRemoveTrailingSlashAndAddHttps(primaryLinkUrl);

    expect(result).toBe('ftp://example.com');
  });
});
