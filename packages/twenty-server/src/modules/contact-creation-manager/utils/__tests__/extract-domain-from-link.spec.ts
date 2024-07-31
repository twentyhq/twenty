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
});
