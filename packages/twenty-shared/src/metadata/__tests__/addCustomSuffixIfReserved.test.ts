import { addCustomSuffixIfIsReserved } from '@/metadata/add-custom-suffix-if-reserved.util';

describe('addCustomSuffixIfIsReserved', () => {
  it('should add Custom suffix for reserved name "event"', () => {
    expect(addCustomSuffixIfIsReserved('event')).toBe('eventCustom');
  });

  it('should not modify non-reserved names', () => {
    expect(addCustomSuffixIfIsReserved('myField')).toBe('myField');
  });

  it('should add Custom suffix for reserved name "type"', () => {
    expect(addCustomSuffixIfIsReserved('type')).toBe('typeCustom');
  });

  it('should return empty string for empty input', () => {
    expect(addCustomSuffixIfIsReserved('')).toBe('');
  });
});
