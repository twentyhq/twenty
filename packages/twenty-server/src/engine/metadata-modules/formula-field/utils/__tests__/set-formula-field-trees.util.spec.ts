import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { setFormulaFieldTrees } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-trees.util';

const setGadgetFormulaTrees = (
  universalSettings: Record<string, unknown>,
  existingUniversalSettings?: Record<string, unknown>,
) =>
  setFormulaFieldTrees({
    existingUniversalSettings,
    universalFlatFieldMetadata: getFlatFieldMetadataMock({
      universalIdentifier: 'gadget-margin-uid',
      name: 'margin',
      type: FieldMetadataType.NUMBER,
      objectMetadataId: 'gadget-object',
      objectMetadataUniversalIdentifier: 'gadget-object-uid',
      universalSettings,
    }),
    universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  }).universalSettings;

describe('setFormulaFieldTrees', () => {
  it('should store the formula as a tree reading fields by identifier, dropping what was sent alongside', () => {
    expect(
      setGadgetFormulaTrees({
        decimals: 2,
        formula: {
          expression: 'price * supplier.revenue.amountMicros',
          bindings: { price: 'forged-uid' },
        },
      }),
    ).toEqual({
      decimals: 2,
      formula: {
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
      },
    });
  });

  it('should leave a formula that does not compile as text, for the validator to report', () => {
    const universalSettings = { formula: { expression: 'missing * 2' } };

    expect(setGadgetFormulaTrees(universalSettings)).toEqual(universalSettings);
  });

  it('should keep stored trees when no text is written', () => {
    const universalSettings = {
      formula: {
        tree: { type: 'FIELD', fieldUniversalIdentifier: 'gadget-price-uid' },
      },
    };

    expect(setGadgetFormulaTrees(universalSettings)).toEqual(universalSettings);
  });

  it('should keep the stored tree over unchanged text kept from 2.64, which a rename leaves stale', () => {
    const tree = {
      type: 'FIELD',
      fieldUniversalIdentifier: 'gadget-price-uid',
    };
    const settingsKeptFrom264 = {
      formula: {
        expression: 'cost',
        bindings: { cost: 'gadget-price-uid' },
        tree,
        evaluation: 'STORED',
      },
    };

    expect(
      setGadgetFormulaTrees(settingsKeptFrom264, settingsKeptFrom264),
    ).toEqual({ formula: { tree, evaluation: 'STORED' } });
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
          universalSettings: {
            formula: {
              expression: 'avg(gadgets.price)',
              evaluation: 'QUERY_TIME',
            },
          },
        }),
        universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }).universalSettings,
    ).toEqual({
      formula: {
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
      },
    });
  });

  it('should leave a field without formula untouched', () => {
    expect(setGadgetFormulaTrees({ decimals: 2 })).toEqual({ decimals: 2 });
  });
});
