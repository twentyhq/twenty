import {
  computeMorphRelationGqlFieldJoinColumnName,
  computeRelationGqlFieldJoinColumnName,
} from '@/utils/fieldMetadata/compute-relation-gql-field-join-column-name';

describe('computeRelationGqlFieldJoinColumnName', () => {
  it('should append `Id` to a simple field name', () => {
    expect(computeRelationGqlFieldJoinColumnName({ name: 'company' })).toBe(
      'companyId',
    );
  });

  it('should preserve camelCase field names', () => {
    expect(
      computeRelationGqlFieldJoinColumnName({ name: 'pointOfContact' }),
    ).toBe('pointOfContactId');
  });

  it('should append `Id` to a morph-aware field name', () => {
    expect(
      computeRelationGqlFieldJoinColumnName({ name: 'targetOpportunity' }),
    ).toBe('targetOpportunityId');
  });

  it('should not strip an existing trailing `Id` (it just appends)', () => {
    expect(computeRelationGqlFieldJoinColumnName({ name: 'companyId' })).toBe(
      'companyIdId',
    );
  });
});

describe('computeMorphRelationGqlFieldJoinColumnName', () => {
  it('should combine field name and capitalized singular target for MANY_TO_ONE', () => {
    expect(
      computeMorphRelationGqlFieldJoinColumnName({
        fieldName: 'target',
        relationType: 'MANY_TO_ONE' as any,
        targetObjectMetadataNameSingular: 'opportunity',
        targetObjectMetadataNamePlural: 'opportunities',
      }),
    ).toBe('targetOpportunityId');
  });

  it('should combine field name and capitalized plural target for ONE_TO_MANY', () => {
    expect(
      computeMorphRelationGqlFieldJoinColumnName({
        fieldName: 'caretaker',
        relationType: 'ONE_TO_MANY' as any,
        targetObjectMetadataNameSingular: 'person',
        targetObjectMetadataNamePlural: 'people',
      }),
    ).toBe('caretakerPeopleId');
  });

  it('should handle simple plurals (e.g. `companies`)', () => {
    expect(
      computeMorphRelationGqlFieldJoinColumnName({
        fieldName: 'parent',
        relationType: 'ONE_TO_MANY' as any,
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toBe('parentCompaniesId');
  });

  it('should throw on an invalid relation type', () => {
    expect(() =>
      computeMorphRelationGqlFieldJoinColumnName({
        fieldName: 'target',
        relationType: 'INVALID' as any,
        targetObjectMetadataNameSingular: 'opportunity',
        targetObjectMetadataNamePlural: 'opportunities',
      }),
    ).toThrow();
  });
});
