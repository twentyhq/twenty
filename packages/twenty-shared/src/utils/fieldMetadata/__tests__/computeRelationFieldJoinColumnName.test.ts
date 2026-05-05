import {
  computeMorphRelationFieldJoinColumnName,
  computeRelationFieldJoinColumnName,
} from '@/utils/fieldMetadata/compute-relation-field-join-column-name';

describe('computeRelationFieldJoinColumnName', () => {
  it('should return name suffixed with Id', () => {
    expect(computeRelationFieldJoinColumnName({ name: 'company' })).toBe(
      'companyId',
    );
  });

  it('should preserve already-prefixed names', () => {
    expect(
      computeRelationFieldJoinColumnName({ name: 'targetOpportunity' }),
    ).toBe('targetOpportunityId');
  });
});

describe('computeMorphRelationFieldJoinColumnName', () => {
  it('should return singular-based join column for MANY_TO_ONE', () => {
    const result = computeMorphRelationFieldJoinColumnName({
      fieldName: 'target',
      relationType: 'MANY_TO_ONE' as any,
      targetObjectMetadataNameSingular: 'opportunity',
      targetObjectMetadataNamePlural: 'opportunities',
    });

    expect(result).toBe('targetOpportunityId');
  });

  it('should return plural-based join column for ONE_TO_MANY', () => {
    const result = computeMorphRelationFieldJoinColumnName({
      fieldName: 'caretaker',
      relationType: 'ONE_TO_MANY' as any,
      targetObjectMetadataNameSingular: 'person',
      targetObjectMetadataNamePlural: 'people',
    });

    expect(result).toBe('caretakerPeopleId');
  });
});
