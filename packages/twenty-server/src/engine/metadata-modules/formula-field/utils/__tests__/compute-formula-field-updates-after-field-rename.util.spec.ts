import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { computeFormulaFieldUpdatesAfterFieldRename } from 'src/engine/metadata-modules/formula-field/utils/compute-formula-field-updates-after-field-rename.util';

const EXISTING_FIELDS =
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK.byUniversalIdentifier;

const computeRenamedExpressions = (
  args: Partial<
    Parameters<typeof computeFormulaFieldUpdatesAfterFieldRename>[0]
  > &
    Pick<
      Parameters<typeof computeFormulaFieldUpdatesAfterFieldRename>[0],
      'renamedFieldUniversalIdentifier' | 'previousFieldName' | 'newFieldName'
    >,
) =>
  Object.fromEntries(
    Object.entries(
      computeFormulaFieldUpdatesAfterFieldRename({
        universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        existingUniversalFlatFieldMetadataByUniversalIdentifier:
          EXISTING_FIELDS,
        pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier: {},
        deletedUniversalFlatFieldMetadataByUniversalIdentifier: {},
        ...args,
      }),
    ).map(([universalIdentifier, { universalSettings }]) => [
      universalIdentifier,
      universalSettings,
    ]),
  );

describe('computeFormulaFieldUpdatesAfterFieldRename', () => {
  it('should rewrite the formulas of the object that read the renamed field', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        previousFieldName: 'price',
        newFieldName: 'unitPrice',
      }),
    ).toEqual({
      'gadget-total-uid': { formula: { expression: 'unitPrice * quantity' } },
    });
  });

  it('should rewrite lookups and same-object formulas when a field of the related object is renamed', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'supplier-name-uid',
        previousFieldName: 'name',
        newFieldName: 'legalName',
      }),
    ).toEqual({
      'supplier-shout-uid': { formula: { expression: 'legalName || "!"' } },
      'gadget-supplier-label-uid': {
        formula: {
          expression:
            'supplier.legalName || " (" || supplier.revenue.currencyCode || ")"',
        },
      },
    });
  });

  it('should rewrite the relation segment when the relation field is renamed', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-supplier-uid',
        previousFieldName: 'supplier',
        newFieldName: 'vendor',
      }),
    ).toEqual({
      'gadget-supplier-label-uid': {
        formula: {
          expression:
            'vendor.name || " (" || vendor.revenue.currencyCode || ")"',
        },
      },
      'gadget-commission-uid': {
        formula: {
          expression: 'vendor.revenue.amountMicros * 0.1',
          currencyCodeExpression: 'vendor.revenue.currencyCode',
        },
      },
    });
  });

  it('should leave a formula that is deleted in the same build', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        previousFieldName: 'price',
        newFieldName: 'unitPrice',
        deletedUniversalFlatFieldMetadataByUniversalIdentifier: {
          'gadget-total-uid': EXISTING_FIELDS['gadget-total-uid'],
        },
      }),
    ).toEqual({});
  });

  it('should leave formulas untouched when the new name is reserved', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        previousFieldName: 'price',
        newFieldName: 'now',
      }),
    ).toEqual({});
  });
});
