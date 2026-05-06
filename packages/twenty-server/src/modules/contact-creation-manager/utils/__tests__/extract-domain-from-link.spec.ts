import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';

describe('extractDomainFromLink', () => {
  it('should extract domain from link', () => {
    const link = 'https://www.twenty.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('twenty.com');
  });

  it('should extract domain from link without www', () => {
    const link = 'https://twenty.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('twenty.com');
  });

  it('should extract domain from link without protocol', () => {
    const link = 'twenty.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('twenty.com');
  });

  it('should extract domain from link with path', () => {
    const link = 'https://twenty.com/about';
    const result = extractDomainFromLink(link);

    expect(result).toBe('twenty.com');
  });

  it('should lowercase the host', () => {
    expect(extractDomainFromLink('HTTPS://Twenty.COM')).toBe('twenty.com');
  });

  it('should strip a trailing slash', () => {
    expect(extractDomainFromLink('https://twenty.com/')).toBe('twenty.com');
  });

  it('should handle whitespace around the input', () => {
    expect(extractDomainFromLink('   twenty.com  ')).toBe('twenty.com');
  });

  it('should return empty string for empty input', () => {
    expect(extractDomainFromLink('')).toBe('');
  });
});
