import { safeDecodeURIComponent } from '@/utils/url/safeDecodeURIComponent';

describe('safeDecodeURIComponent', () => {
  it('should decode valid encoded components', () => {
    expect(safeDecodeURIComponent('hello%20world')).toBe('hello world');
  });

  it('should return malformed input as-is', () => {
    expect(safeDecodeURIComponent('%E0%A4%A')).toBe('%E0%A4%A');
  });

  it('should return plain text as-is', () => {
    expect(safeDecodeURIComponent('hello')).toBe('hello');
  });
});
