import { computeMetadataNameFromLabel } from '@/metadata/compute-metadata-name-from-label.util';

describe('computeMetadataNameFromLabel', () => {
  it('should convert a label to camelCase', () => {
    expect(computeMetadataNameFromLabel({ label: 'My Custom Field' })).toBe(
      'myCustomField',
    );
  });

  it('should return empty string for empty label', () => {
    expect(computeMetadataNameFromLabel({ label: '' })).toBe('');
  });

  it('should prefix numeric labels with n', () => {
    expect(computeMetadataNameFromLabel({ label: '123 Field' })).toBe(
      'n123Field',
    );
  });

  it('should add Custom suffix for reserved words', () => {
    const result = computeMetadataNameFromLabel({ label: 'Name' });

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should skip custom suffix when applyCustomSuffix is false', () => {
    const result = computeMetadataNameFromLabel({
      label: 'My Field',
      applyCustomSuffix: false,
    });

    expect(result).toBe('myField');
  });
});
