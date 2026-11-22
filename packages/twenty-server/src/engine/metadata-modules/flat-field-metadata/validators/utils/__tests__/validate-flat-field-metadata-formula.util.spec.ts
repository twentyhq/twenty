import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateFlatFieldMetadataFormula } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-formula.util';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';

type ValidateFormulaArgs = Parameters<
  typeof validateFlatFieldMetadataFormula
>[0];

const validate = ({
  flatFieldMetadataToValidate,
  ...overrides
}: Partial<Omit<ValidateFormulaArgs, 'flatFieldMetadataToValidate'>> & {
  flatFieldMetadataToValidate: Partial<
    ValidateFormulaArgs['flatFieldMetadataToValidate']
  >;
}): Pick<FlatFieldMetadataValidationError, 'message'>[] =>
  validateFlatFieldMetadataFormula({
    flatFieldMetadataToValidate: {
      name: 'margin',
      type: FieldMetadataType.NUMBER,
      universalIdentifier: 'gadget-margin-uid',
      universalSettings: { formula: { expression: 'price * 0.2' } },
      objectMetadataUniversalIdentifier: 'gadget-object-uid',
      isUnique: false,
      isSearchable: false,
      ...flatFieldMetadataToValidate,
    },
    universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
    pendingUniversalFlatFieldMetadatas: [],
    isFormulaFieldEnabled: true,
    ...overrides,
  }).map(({ message }) => ({ message }));

describe('validateFlatFieldMetadataFormula', () => {
  it('should accept a formula over the fields of the object and a to-one relation', () => {
    expect(validate({ flatFieldMetadataToValidate: {} })).toEqual([]);
    expect(
      validate({
        flatFieldMetadataToValidate: {
          type: FieldMetadataType.TEXT,
          universalSettings: { formula: { expression: 'supplier.name' } },
        },
      }),
    ).toEqual([]);
  });

  it.each([
    { universalSettings: null },
    { universalSettings: { decimals: 2 } },
    { universalSettings: { decimals: 2, formula: null } },
  ])(
    'should not validate a field without formula: $universalSettings',
    ({ universalSettings }) => {
      expect(
        validate({
          flatFieldMetadataToValidate: { universalSettings, isUnique: true },
          isFormulaFieldEnabled: false,
        }),
      ).toEqual([]);
    },
  );

  it('should refuse a formula when the feature is not enabled', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {},
        isFormulaFieldEnabled: false,
      }),
    ).toEqual([
      { message: 'Formula fields are not enabled for this workspace' },
    ]);
  });

  it('should refuse a formula on a field type that cannot hold one', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: { type: FieldMetadataType.CURRENCY },
      }),
    ).toEqual([{ message: 'Field type CURRENCY does not support formulas' }]);
  });

  it('should refuse a formula without expression', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          universalSettings: { formula: { expression: '' } },
        },
      }),
    ).toEqual([{ message: 'Formula must have a non-empty expression' }]);
  });

  it('should refuse a unique or searchable formula field', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: { isUnique: true, isSearchable: true },
      }),
    ).toEqual([
      { message: 'A formula field cannot be unique' },
      { message: 'A formula field cannot be searchable' },
    ]);
  });

  it.each([
    {
      reason: 'itself',
      expression: 'margin + 1',
      message: 'Invalid formula: Unknown field "margin"',
    },
    {
      reason: 'another formula field',
      expression: 'total * 2',
      message: 'Invalid formula: Unknown field "total"',
    },
    {
      reason: 'a formula field of the related record',
      expression: 'arrayLength(supplier.shout)',
      message: 'Invalid formula: Unknown field "shout" on "supplier"',
    },
    {
      reason: 'a previous value',
      expression: 'previous.price',
      message:
        'Invalid formula: "previous.price" reads a previous value, which a formula cannot use',
    },
  ])('should refuse a formula reading $reason', ({ expression, message }) => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          universalSettings: { formula: { expression } },
        },
      }),
    ).toEqual([{ message }]);
  });

  it('should let a formula read a field created in the same build', () => {
    const [pendingUniversalFlatFieldMetadata] = Object.values(
      FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK.byUniversalIdentifier,
    ).flatMap((flatFieldMetadata) =>
      flatFieldMetadata?.name === 'price'
        ? [{ ...flatFieldMetadata, name: 'cost', universalIdentifier: 'cost' }]
        : [],
    );

    expect(
      validate({
        flatFieldMetadataToValidate: {
          universalSettings: { formula: { expression: 'price - cost' } },
        },
        pendingUniversalFlatFieldMetadatas: [pendingUniversalFlatFieldMetadata],
      }),
    ).toEqual([]);
  });
});
