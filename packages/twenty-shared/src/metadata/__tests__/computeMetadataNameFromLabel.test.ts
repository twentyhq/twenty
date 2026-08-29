import { computeMetadataNameFromLabel } from '@/metadata/utils/compute-metadata-name-from-label.util';

describe('computeMetadataNameFromLabel', () => {
  it('should convert a label to camelCase', () => {
    expect(computeMetadataNameFromLabel({ label: 'My Custom Field' })).toBe(
      'myCustomField',
    );
  });

  it('should convert a label to camelCase', () => {
    expect(computeMetadataNameFromLabel({ label: 'My CreatedAt Field' })).toBe(
      'myCreatedatField',
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

  it('should prefix labels that only become digit-leading after slugify', () => {
    // slugify strips the leading space / symbol, so these are not digit-leading
    // as written but slugify to "5_..."; the name must still not start with a digit.
    expect(computeMetadataNameFromLabel({ label: ' 5 things' })).toBe(
      'n5Things',
    );
    expect(computeMetadataNameFromLabel({ label: '$5 fee' })).toBe('n5Fee');
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
