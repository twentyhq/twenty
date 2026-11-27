import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateFlatFieldMetadataFormula } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-formula.util';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { setFormulaFieldTrees } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-trees.util';

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
      formula: { expression: 'price * 0.2' },
      objectMetadataUniversalIdentifier: 'gadget-object-uid',
      isUnique: false,
      isSearchable: false,
      ...flatFieldMetadataToValidate,
    },
    universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
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
          formula: { expression: 'supplier.name' },
        },
      }),
    ).toEqual([]);
  });

  it.each([{ formula: null }, { formula: undefined }])(
    'should not validate a field without formula: $formula',
    ({ formula }) => {
      expect(
        validate({
          flatFieldMetadataToValidate: { formula, isUnique: true },
          isFormulaFieldEnabled: false,
        }),
      ).toEqual([]);
    },
  );

  it('should refuse a new or changed formula when the feature is not enabled', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {},
        isFormulaFieldEnabled: false,
      }),
    ).toEqual([
      { message: 'Formula fields are not enabled for this workspace' },
    ]);
    expect(
      validate({
        flatFieldMetadataToValidate: {},
        existingFormula: { expression: 'price * 0.1' },
        isFormulaFieldEnabled: false,
      }),
    ).toEqual([
      { message: 'Formula fields are not enabled for this workspace' },
    ]);
  });

  it('should let an unchanged formula through when the feature is not enabled', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {},
        existingFormula: { expression: 'price * 0.2' },
        isFormulaFieldEnabled: false,
      }),
    ).toEqual([]);
  });

  it('should let a formula through unchanged when the feature is not enabled, once converted to a tree', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          formula: {
            tree: {
              type: 'ARITHMETIC',
              operator: 'MULTIPLY',
              left: {
                type: 'FIELD',
                fieldUniversalIdentifier: 'gadget-price-uid',
              },
              right: { type: 'LITERAL', value: 0.2 },
            },
          },
        },
        existingFormula: { expression: 'price*0.2' },
        isFormulaFieldEnabled: false,
      }),
    ).toEqual([]);
  });

  it('should refuse a tree that is not an expression tree', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          formula: { tree: { type: 'ARITHMETIC' } },
        },
      }),
    ).toEqual([
      {
        message:
          'Invalid formula: its tree is not an expression tree, write the formula as text instead',
      },
    ]);
  });

  it('should refuse a formula whose value does not fit the field type', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          formula: { expression: 'supplier.name' },
        },
      }),
    ).toEqual([
      {
        message: 'Invalid formula: This field needs a number, but got text',
      },
    ]);
    expect(
      validate({
        flatFieldMetadataToValidate: {
          type: FieldMetadataType.BOOLEAN,
          formula: { expression: 'price > "cheap"' },
        },
      }),
    ).toEqual([
      { message: 'Invalid formula: ">" cannot mix a number and text' },
    ]);
  });

  it('should refuse a formula on a field type that cannot hold one', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: { type: FieldMetadataType.ADDRESS },
      }),
    ).toEqual([{ message: 'Field type ADDRESS does not support formulas' }]);
  });

  it('should require a valid currency code expression on a currency formula', () => {
    const validateCurrency = (currencyCodeExpression?: string) =>
      validate({
        flatFieldMetadataToValidate: {
          type: FieldMetadataType.CURRENCY,
          formula: {
            expression: 'price * 1000000',
            ...(isDefined(currencyCodeExpression)
              ? { currencyCodeExpression }
              : {}),
          },
        },
      });

    expect(validateCurrency('supplier.revenue.currencyCode')).toEqual([]);
    expect(validateCurrency('"USD"')).toEqual([]);
    expect(validateCurrency()).toEqual([
      {
        message:
          'Invalid formula: A currency formula needs a currency code expression',
      },
    ]);
    expect(validateCurrency('missing')).toEqual([
      { message: expect.stringContaining('Invalid formula') },
    ]);
  });

  it('should refuse a changed currency code expression when the feature is not enabled', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          type: FieldMetadataType.CURRENCY,
          formula: {
            expression: 'price',
            currencyCodeExpression: '"EUR"',
          },
        },
        existingFormula: {
          expression: 'price',
          currencyCodeExpression: '"USD"',
        },
        isFormulaFieldEnabled: false,
      }),
    ).toEqual([
      { message: 'Formula fields are not enabled for this workspace' },
    ]);
  });

  it('should refuse a formula without expression', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          formula: { expression: '' },
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
      reason: 'a previous value',
      expression: 'previous.price',
      message:
        'Invalid formula: "previous.price" reads a previous value, which a formula cannot use',
    },
  ])('should refuse a formula reading $reason', ({ expression, message }) => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          formula: { expression },
        },
      }),
    ).toEqual([{ message }]);
  });

  it('should accept a formula reading other formula fields, on the record and behind a relation', () => {
    expect(
      validate({
        flatFieldMetadataToValidate: {
          type: FieldMetadataType.TEXT,
          formula: { expression: 'concat(total * 2, supplier.shout)' },
        },
      }),
    ).toEqual([]);
  });

  it('should refuse a stored formula reading now through a query-time formula', () => {
    const flatFieldMetadataToValidate = setFormulaFieldTrees({
      universalFlatFieldMetadata: getFlatFieldMetadataMock({
        name: 'checkSummary',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'supplier-check-summary-uid',
        objectMetadataId: 'supplier-object',
        objectMetadataUniversalIdentifier: 'supplier-object-uid',
        formula: { expression: 'concat(count(gadgets), checkedAt)' },
      }),
      universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
      universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
    });

    expect(validate({ flatFieldMetadataToValidate })).toEqual([
      { message: expect.stringContaining('cannot read "now"') },
    ]);
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
          formula: { expression: 'price - cost' },
        },
        pendingUniversalFlatFieldMetadataMaps: {
          byUniversalIdentifier: { cost: pendingUniversalFlatFieldMetadata },
        },
      }),
    ).toEqual([]);
  });
});
