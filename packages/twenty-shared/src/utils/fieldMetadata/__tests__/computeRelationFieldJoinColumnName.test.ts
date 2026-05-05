import {
  computeMorphRelationFieldJoinColumnName,
  computeRelationFieldJoinColumnName,
} from '@/utils/fieldMetadata/compute-relation-field-join-column-name';

describe('computeRelationFieldJoinColumnName', () => {
  it('should append `Id` to a simple field name', () => {
    expect(computeRelationFieldJoinColumnName({ name: 'company' })).toBe(
      'companyId',
    );
  });

  it('should preserve camelCase field names', () => {
    expect(computeRelationFieldJoinColumnName({ name: 'pointOfContact' })).toBe(
      'pointOfContactId',
    );
  });

  it('should append `Id` to a morph-aware field name', () => {
    expect(
      computeRelationFieldJoinColumnName({ name: 'targetOpportunity' }),
    ).toBe('targetOpportunityId');
  });

  it('should not strip an existing trailing `Id` (it just appends)', () => {
    expect(computeRelationFieldJoinColumnName({ name: 'companyId' })).toBe(
      'companyIdId',
    );
  });
});

describe('computeMorphRelationFieldJoinColumnName', () => {
  it('should combine field name and capitalized singular target for MANY_TO_ONE', () => {
    expect(
      computeMorphRelationFieldJoinColumnName({
        fieldName: 'target',
        relationType: 'MANY_TO_ONE' as any,
        targetObjectMetadataNameSingular: 'opportunity',
        targetObjectMetadataNamePlural: 'opportunities',
      }),
    ).toBe('targetOpportunityId');
  });

  it('should combine field name and capitalized plural target for ONE_TO_MANY', () => {
    expect(
      computeMorphRelationFieldJoinColumnName({
        fieldName: 'caretaker',
        relationType: 'ONE_TO_MANY' as any,
        targetObjectMetadataNameSingular: 'person',
        targetObjectMetadataNamePlural: 'people',
      }),
    ).toBe('caretakerPeopleId');
  });

  it('should handle simple plurals (e.g. `companies`)', () => {
    expect(
      computeMorphRelationFieldJoinColumnName({
        fieldName: 'parent',
        relationType: 'ONE_TO_MANY' as any,
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toBe('parentCompaniesId');
  });

  it('should throw on an invalid relation type', () => {
    expect(() =>
      computeMorphRelationFieldJoinColumnName({
        fieldName: 'target',
        relationType: 'INVALID' as any,
        targetObjectMetadataNameSingular: 'opportunity',
        targetObjectMetadataNamePlural: 'opportunities',
      }),
    ).toThrow();
  });
});
