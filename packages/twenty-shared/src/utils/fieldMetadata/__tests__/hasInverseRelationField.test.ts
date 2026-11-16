import { hasInverseRelationField } from '@/utils/fieldMetadata/hasInverseRelationField';

describe('hasInverseRelationField', () => {
  it.each([
    { relationTargetFieldMetadataId: 'inverse-field-id' },
    { relationTargetFieldMetadataUniversalIdentifier: 'inverse-field' },
  ])('is true for %j', (fieldMetadata) => {
    expect(hasInverseRelationField(fieldMetadata)).toBe(true);
  });

  it.each([
    {},
    { relationTargetFieldMetadataId: null },
    { relationTargetFieldMetadataUniversalIdentifier: null },
  ])('is false for %j', (fieldMetadata) => {
    expect(hasInverseRelationField(fieldMetadata)).toBe(false);
  });
});
