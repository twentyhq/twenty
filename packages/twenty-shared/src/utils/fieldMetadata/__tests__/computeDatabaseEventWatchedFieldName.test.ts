import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { computeDatabaseEventWatchedFieldName } from '@/utils/fieldMetadata/computeDatabaseEventWatchedFieldName';

describe('computeDatabaseEventWatchedFieldName', () => {
  it('keeps the name of a field that is not a relation', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'stage',
        type: FieldMetadataType.SELECT,
      }),
    ).toBe('stage');
  });

  it('watches a relation to one record through its join column', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationType: RelationType.MANY_TO_ONE,
      }),
    ).toBe('companyId');
  });

  it('watches a morph target through its own join column', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'targetCompany',
        type: FieldMetadataType.MORPH_RELATION,
        relationType: RelationType.MANY_TO_ONE,
      }),
    ).toBe('targetCompanyId');
  });

  it('cannot watch a relation to many records', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'pointOfContacts',
        type: FieldMetadataType.RELATION,
        relationType: RelationType.ONE_TO_MANY,
      }),
    ).toBeUndefined();
  });
});
