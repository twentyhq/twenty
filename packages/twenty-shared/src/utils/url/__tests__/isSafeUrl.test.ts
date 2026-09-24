import { isSafeUrl } from '@/utils/url/isSafeUrl';

describe('isSafeUrl', () => {
  it('accepts same-origin relative paths', () => {
    expect(isSafeUrl('/')).toBe(true);
    expect(isSafeUrl('/settings')).toBe(true);
    expect(isSafeUrl('/objects/people?view=1#top')).toBe(true);
  });

  it('accepts absolute urls with a safe protocol', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com/path')).toBe(true);
    expect(isSafeUrl('mailto:someone@example.com')).toBe(true);
    expect(isSafeUrl('tel:+33612345678')).toBe(true);
  });

  it('rejects unsafe protocols', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('rejects scheme-relative urls that leave the current origin', () => {
    expect(isSafeUrl('//evil.com')).toBe(false);
    expect(isSafeUrl('/\\evil.com')).toBe(false);
    expect(isSafeUrl('/\\\\evil.com')).toBe(false);
    expect(isSafeUrl('/\\/evil.com')).toBe(false);
    expect(isSafeUrl('/\t\\evil.com')).toBe(false);
  });

  it('rejects unparsable input', () => {
    expect(isSafeUrl('')).toBe(false);
    expect(isSafeUrl('not a url')).toBe(false);
  });
});
