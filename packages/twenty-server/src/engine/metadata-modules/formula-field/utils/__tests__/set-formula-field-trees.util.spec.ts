import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { setFormulaFieldTrees } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-trees.util';

const setGadgetFormulaTrees = (formula: Record<string, unknown> | null) =>
  setFormulaFieldTrees({
    universalFlatFieldMetadata: getFlatFieldMetadataMock({
      universalIdentifier: 'gadget-margin-uid',
      name: 'margin',
      type: FieldMetadataType.NUMBER,
      objectMetadataId: 'gadget-object',
      objectMetadataUniversalIdentifier: 'gadget-object-uid',
      formula,
    }),
    universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  }).formula;

describe('setFormulaFieldTrees', () => {
  it('should store the formula as a tree reading fields by identifier, dropping what was sent alongside', () => {
    expect(
      setGadgetFormulaTrees({
        expression: 'price * supplier.revenue.amountMicros',
        bindings: { price: 'forged-uid' },
      }),
    ).toEqual({
      tree: {
        type: 'ARITHMETIC',
        operator: 'MULTIPLY',
        left: { type: 'FIELD', fieldUniversalIdentifier: 'gadget-price-uid' },
        right: {
          type: 'FIELD',
          relationFieldUniversalIdentifier: 'gadget-supplier-uid',
          fieldUniversalIdentifier: 'supplier-revenue-uid',
          subFieldName: 'amountMicros',
        },
      },
    });
  });

  it('should leave a formula that does not compile as text, for the validator to report', () => {
    const formula = { expression: 'missing * 2' };

    expect(setGadgetFormulaTrees(formula)).toEqual(formula);
  });

  it('should keep stored trees when no text is written', () => {
    const formula = {
      tree: { type: 'FIELD', fieldUniversalIdentifier: 'gadget-price-uid' },
    };

    expect(setGadgetFormulaTrees(formula)).toEqual(formula);
  });

  it('should store a formula that aggregates related records', () => {
    expect(
      setFormulaFieldTrees({
        universalFlatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: 'supplier-average-price-uid',
          name: 'averagePrice',
          type: FieldMetadataType.NUMBER,
          objectMetadataId: 'supplier-object',
          objectMetadataUniversalIdentifier: 'supplier-object-uid',
          formula: { expression: 'avg(gadgets.price)' },
        }),
        universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }).formula,
    ).toEqual({
      tree: {
        type: 'FUNCTION_CALL',
        functionName: 'avg',
        arguments: [
          {
            type: 'FIELD',
            relationFieldUniversalIdentifier: 'supplier-gadgets-uid',
            fieldUniversalIdentifier: 'gadget-price-uid',
          },
        ],
      },
      evaluation: 'STORED',
    });
  });

  it('should compile a formula sent as a tree like its text, so an aggregate is stored', () => {
    const tree = {
      type: 'FUNCTION_CALL',
      functionName: 'avg',
      arguments: [
        {
          type: 'FIELD',
          relationFieldUniversalIdentifier: 'supplier-gadgets-uid',
          fieldUniversalIdentifier: 'gadget-price-uid',
        },
      ],
    };

    expect(
      setFormulaFieldTrees({
        universalFlatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: 'supplier-average-price-uid',
          name: 'averagePrice',
          type: FieldMetadataType.NUMBER,
          objectMetadataId: 'supplier-object',
          objectMetadataUniversalIdentifier: 'supplier-object-uid',
          formula: { tree },
        }),
        universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }).formula,
    ).toEqual({ tree, evaluation: 'STORED' });
  });

  it('should keep the evaluation that was written, for the validator to check', () => {
    expect(
      setGadgetFormulaTrees({ expression: 'price', evaluation: 'STORED' }),
    ).toMatchObject({ evaluation: 'STORED' });
    expect(
      setFormulaFieldTrees({
        universalFlatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: 'supplier-average-price-uid',
          name: 'averagePrice',
          type: FieldMetadataType.NUMBER,
          objectMetadataId: 'supplier-object',
          objectMetadataUniversalIdentifier: 'supplier-object-uid',
          formula: {
            expression: 'avg(gadgets.price)',
            evaluation: 'QUERY_TIME',
          },
        }),
        universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }).formula,
    ).toMatchObject({ evaluation: 'QUERY_TIME' });
  });

  it('should keep a stored formula stored when its new expression leaves the evaluation out', () => {
    expect(
      setFormulaFieldTrees({
        universalFlatFieldMetadata: getFlatFieldMetadataMock({
          universalIdentifier: 'supplier-gadget-count-uid',
          name: 'gadgetCount',
          type: FieldMetadataType.NUMBER,
          objectMetadataId: 'supplier-object',
          objectMetadataUniversalIdentifier: 'supplier-object-uid',
          formula: { expression: '5' },
        }),
        universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }).formula,
    ).toEqual({
      tree: { type: 'LITERAL', value: 5 },
      evaluation: 'STORED',
    });
  });

  it('should leave a field without formula untouched', () => {
    expect(setGadgetFormulaTrees(null)).toBeNull();
  });
});
