import { getSafeUrl } from '@/utils/url/getSafeUrl';

describe('getSafeUrl', () => {
  it('returns safe absolute urls unchanged', () => {
    expect(getSafeUrl('https://twenty.com')).toBe('https://twenty.com');
    expect(getSafeUrl('http://twenty.com/path?q=1#h')).toBe(
      'http://twenty.com/path?q=1#h',
    );
    expect(getSafeUrl('mailto:hello@twenty.com')).toBe(
      'mailto:hello@twenty.com',
    );
    expect(getSafeUrl('tel:+33123456789')).toBe('tel:+33123456789');
  });

  it('keeps same-origin relative paths', () => {
    expect(getSafeUrl('/')).toBe('/');
    expect(getSafeUrl('/settings/profile')).toBe('/settings/profile');
    expect(getSafeUrl('/objects/people?view=1#top')).toBe(
      '/objects/people?view=1#top',
    );
  });

  it('prepends https to scheme-less hosts', () => {
    expect(getSafeUrl('twenty.com')).toBe('https://twenty.com');
    expect(getSafeUrl('example.com/path')).toBe('https://example.com/path');
  });

  it('rejects dangerous schemes', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeUndefined();
    expect(getSafeUrl('JavaScript:alert(1)')).toBeUndefined();
    expect(
      getSafeUrl('data:text/html,<script>alert(1)</script>'),
    ).toBeUndefined();
    expect(getSafeUrl('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('rejects scheme-relative urls that leave the current origin', () => {
    expect(getSafeUrl('//evil.com')).toBeUndefined();
    expect(getSafeUrl('/\\evil.com')).toBeUndefined();
    expect(getSafeUrl('/\\\\evil.com')).toBeUndefined();
    expect(getSafeUrl('/\\/evil.com')).toBeUndefined();
    expect(getSafeUrl('/\t\\evil.com')).toBeUndefined();
  });

  it('returns undefined for empty or nullish values', () => {
    expect(getSafeUrl('')).toBeUndefined();
    expect(getSafeUrl('   ')).toBeUndefined();
    expect(getSafeUrl(undefined)).toBeUndefined();
    expect(getSafeUrl(null)).toBeUndefined();
  });
});
