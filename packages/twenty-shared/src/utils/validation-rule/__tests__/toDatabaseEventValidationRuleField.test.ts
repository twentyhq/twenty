import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { toDatabaseEventValidationRuleField } from '@/utils/validation-rule/toDatabaseEventValidationRuleField';

describe('toDatabaseEventValidationRuleField', () => {
  it('keeps a scalar field as it is', () => {
    expect(
      toDatabaseEventValidationRuleField({
        name: 'stage',
        type: FieldMetadataType.SELECT,
        universalIdentifier: 'stage-id',
      }),
    ).toEqual({
      name: 'stage',
      type: FieldMetadataType.SELECT,
      universalIdentifier: 'stage-id',
    });
  });

  it('reads a relation to one record through its join column', () => {
    expect(
      toDatabaseEventValidationRuleField({
        name: 'company',
        type: FieldMetadataType.RELATION,
        universalIdentifier: 'company-id',
        relationType: RelationType.MANY_TO_ONE,
      }),
    ).toEqual({
      name: 'companyId',
      type: FieldMetadataType.UUID,
      universalIdentifier: 'company-id',
    });
  });

  it('leaves out a relation to many records', () => {
    expect(
      toDatabaseEventValidationRuleField({
        name: 'pointOfContacts',
        type: FieldMetadataType.RELATION,
        universalIdentifier: 'contacts-id',
        relationType: RelationType.ONE_TO_MANY,
      }),
    ).toBeUndefined();
  });
});
