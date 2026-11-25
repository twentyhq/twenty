import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { setFormulaFieldBindings } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-bindings.util';

const setBindings = ({
  universalSettings,
  existingUniversalSettings,
}: {
  universalSettings: Record<string, unknown> | null;
  existingUniversalSettings?: Parameters<
    typeof setFormulaFieldBindings
  >[0]['existingUniversalSettings'];
}) =>
  setFormulaFieldBindings({
    universalFlatFieldMetadata: getFlatFieldMetadataMock({
      universalIdentifier: 'gadget-margin-uid',
      name: 'margin',
      type: FieldMetadataType.NUMBER,
      objectMetadataId: 'gadget-object',
      objectMetadataUniversalIdentifier: 'gadget-object-uid',
      universalSettings,
    }),
    existingUniversalSettings,
    universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    universalFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  }).universalSettings;

describe('setFormulaFieldBindings', () => {
  it('should bind the fields a formula reads, replacing what was sent', () => {
    expect(
      setBindings({
        universalSettings: {
          decimals: 2,
          formula: {
            expression: 'price * supplier.revenue.amountMicros',
            bindings: { price: 'forged-uid' },
          },
        },
      }),
    ).toEqual({
      decimals: 2,
      formula: {
        expression: 'price * supplier.revenue.amountMicros',
        bindings: {
          price: 'gadget-price-uid',
          supplier: 'gadget-supplier-uid',
          'supplier.revenue': 'supplier-revenue-uid',
        },
      },
    });
  });

  it('should bind nothing when the formula does not compile', () => {
    expect(
      setBindings({
        universalSettings: { formula: { expression: 'missing * 2' } },
      }),
    ).toEqual({ formula: { expression: 'missing * 2', bindings: {} } });
  });

  it('should keep the stored bindings while the expression is unchanged', () => {
    const existingUniversalSettings = {
      formula: {
        expression: 'missing * 2',
        bindings: { missing: 'deleted-field-uid' },
      },
    };

    expect(
      setBindings({
        universalSettings: { formula: { expression: 'missing * 2' } },
        existingUniversalSettings,
      }),
    ).toEqual(existingUniversalSettings);
  });

  it('should store a formula that aggregates related records', () => {
    expect(
      setFormulaFieldBindings({
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
        expression: 'avg(gadgets.price)',
        bindings: {
          gadgets: 'supplier-gadgets-uid',
          'gadgets.price': 'gadget-price-uid',
        },
        evaluation: 'STORED',
      },
    });
  });

  it('should leave a field without formula untouched', () => {
    expect(setBindings({ universalSettings: { decimals: 2 } })).toEqual({
      decimals: 2,
    });
  });
});
