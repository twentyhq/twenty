import { FieldMetadataType } from '@/types';
import { getRlsPredicateCompatibleWorkspaceMemberFieldTypes } from '@/utils/filter/getRlsPredicateCompatibleWorkspaceMemberFieldTypes';

describe('getRlsPredicateCompatibleWorkspaceMemberFieldTypes', () => {
  it.each([
    [
      FieldMetadataType.TEXT,
      undefined,
      [FieldMetadataType.TEXT, FieldMetadataType.UUID],
    ],
    [FieldMetadataType.BOOLEAN, undefined, [FieldMetadataType.BOOLEAN]],
    [FieldMetadataType.DATE, undefined, [FieldMetadataType.DATE]],
    [
      FieldMetadataType.NUMBER,
      undefined,
      [FieldMetadataType.NUMBER, FieldMetadataType.NUMERIC],
    ],
    [
      FieldMetadataType.SELECT,
      undefined,
      [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT],
    ],
    [
      FieldMetadataType.MULTI_SELECT,
      undefined,
      [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT],
    ],
    [
      FieldMetadataType.RELATION,
      undefined,
      [
        FieldMetadataType.RELATION,
        FieldMetadataType.UUID,
        FieldMetadataType.ARRAY,
      ],
    ],
    [
      FieldMetadataType.ACTOR,
      'workspaceMemberId',
      [
        FieldMetadataType.RELATION,
        FieldMetadataType.UUID,
        FieldMetadataType.ARRAY,
      ],
    ],
    [
      FieldMetadataType.ARRAY,
      undefined,
      [FieldMetadataType.TEXT, FieldMetadataType.UUID],
    ],
    [
      FieldMetadataType.EMAILS,
      undefined,
      [FieldMetadataType.TEXT, FieldMetadataType.UUID],
    ],
    [
      FieldMetadataType.EMAILS,
      'primaryEmail',
      [FieldMetadataType.TEXT, FieldMetadataType.UUID],
    ],
    [
      FieldMetadataType.ACTOR,
      'source',
      [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT],
    ],
    [
      FieldMetadataType.CURRENCY,
      undefined,
      [FieldMetadataType.NUMBER, FieldMetadataType.NUMERIC],
    ],
    [FieldMetadataType.RATING, undefined, []],
  ])(
    'should list the member field types a %s field (sub field %s) compares to',
    (fieldType, subFieldName, expected) => {
      expect(
        getRlsPredicateCompatibleWorkspaceMemberFieldTypes({
          fieldType,
          subFieldName,
        }),
      ).toEqual(expected);
    },
  );
});
