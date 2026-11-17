import { hasInverseRelationField } from '@/utils/fieldMetadata/hasInverseRelationField';

describe('hasInverseRelationField', () => {
  it('narrows a defined inverse field id', () => {
    const fieldMetadata: { relationTargetFieldMetadataId: string | null } = {
      relationTargetFieldMetadataId: 'inverse-field-id',
    };

    expect(hasInverseRelationField(fieldMetadata)).toBe(true);

    if (hasInverseRelationField(fieldMetadata)) {
      const inverseFieldId: string =
        fieldMetadata.relationTargetFieldMetadataId;

      expect(inverseFieldId).toBe('inverse-field-id');
    }
  });

  it.each([
    {},
    { relationTargetFieldMetadataId: null },
    { relationTargetFieldMetadataId: undefined },
    {
      relationTargetFieldMetadataId: null,
      relationTargetFieldMetadataUniversalIdentifier: 'inverse-field',
    },
  ])('does not narrow an absent inverse field id for %j', (fieldMetadata) => {
    expect(hasInverseRelationField(fieldMetadata)).toBe(false);
  });
});
