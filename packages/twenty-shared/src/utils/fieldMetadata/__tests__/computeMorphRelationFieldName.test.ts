import { computeMorphRelationFieldName } from '@/utils/fieldMetadata/compute-morph-relation-field-name';

describe('computeMorphRelationFieldName', () => {
  it('should return singular-based name for MANY_TO_ONE', () => {
    const result = computeMorphRelationFieldName({
      fieldName: 'assigned',
      relationType: 'MANY_TO_ONE' as any,
      targetObjectMetadataNameSingular: 'person',
      targetObjectMetadataNamePlural: 'people',
    });

    expect(result).toBe('assignedPerson');
  });

  it('should return plural-based name for ONE_TO_MANY', () => {
    const result = computeMorphRelationFieldName({
      fieldName: 'assigned',
      relationType: 'ONE_TO_MANY' as any,
      targetObjectMetadataNameSingular: 'person',
      targetObjectMetadataNamePlural: 'people',
    });

    expect(result).toBe('assignedPeople');
  });

  it('should throw for invalid relation type', () => {
    expect(() =>
      computeMorphRelationFieldName({
        fieldName: 'assigned',
        relationType: 'INVALID' as any,
        targetObjectMetadataNameSingular: 'person',
        targetObjectMetadataNamePlural: 'people',
      }),
    ).toThrow();
  });
});
