import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

describe('classifyEngagementUserAgent', () => {
  it('treats the Apple Mail privacy proxy as a proxy, not a person', () => {
    expect(classifyEngagementUserAgent('Mozilla/5.0')).toBe('PRIVACY_PROXY');
  });

  it('flags a security scanner as automation', () => {
    expect(
      classifyEngagementUserAgent(
        'Mozilla/5.0 (compatible; Mimecast Link Scanner)',
      ),
    ).toBe('SUSPECTED_AUTOMATION');
  });

  it('leaves a desktop mail client unclassified', () => {
    expect(
      classifyEngagementUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      ),
    ).toBe('UNCLASSIFIED');
  });

  it('handles a missing user agent', () => {
    expect(classifyEngagementUserAgent(null)).toBe('UNCLASSIFIED');
  });
});
