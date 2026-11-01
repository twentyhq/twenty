import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

describe('classifyEngagementUserAgent', () => {
  it('treats the Apple Mail privacy proxy as a proxy, not a person', () => {
    expect(classifyEngagementUserAgent('Mozilla/5.0')).toBe('PRIVACY_PROXY');
  });

  it('leaves the Gmail and Yahoo image proxies unclassified, since they only fetch when the recipient opens the email', () => {
    expect(
      classifyEngagementUserAgent(
        'Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)',
      ),
    ).toBe('UNCLASSIFIED');
    expect(
      classifyEngagementUserAgent(
        'YahooMailProxy; https://help.yahoo.com/kb/yahoo-mail-proxy-SLN28749.html',
      ),
    ).toBe('UNCLASSIFIED');
  });

  it('flags a security scanner as automation', () => {
    expect(
      classifyEngagementUserAgent(
        'Mozilla/5.0 (compatible; Mimecast Link Scanner)',
      ),
    ).toBe('SUSPECTED_AUTOMATION');
  });

  it('flags the Gmail delivery-time scanner, which fetches before the recipient opens', () => {
    expect(
      classifyEngagementUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246 Mozilla/5.0',
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
