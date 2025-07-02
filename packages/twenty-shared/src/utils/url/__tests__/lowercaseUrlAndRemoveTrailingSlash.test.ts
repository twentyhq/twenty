import { lowercaseUrlAndRemoveTrailingSlash } from '@/utils/url/lowercaseUrlAndRemoveTrailingSlash';

describe('lowercaseUrlAndRemoveTrailingSlash', () => {
  it('should leave lowcased domain unchanged', () => {
    const primaryLinkUrl = 'https://www.example.com/test';
    const result = lowercaseUrlAndRemoveTrailingSlash(primaryLinkUrl);

    expect(result).toBe('https://www.example.com/test');
  });

  it('should lowercase the domain of the primary link url', () => {
    const primaryLinkUrl = 'htTps://wwW.exAmple.coM/TEST';
    const result = lowercaseUrlAndRemoveTrailingSlash(primaryLinkUrl);

    expect(result).toBe('https://www.example.com/TEST');
  });

  it('should not add a trailing slash', () => {
    const primaryLinkUrl = 'https://www.example.com';
    const result = lowercaseUrlAndRemoveTrailingSlash(primaryLinkUrl);

    expect(result).toBe('https://www.example.com');
  });
});
