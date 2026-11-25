import { FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK } from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { computeFormulaFieldUpdatesAfterFieldRenames } from 'src/engine/metadata-modules/formula-field/utils/compute-formula-field-updates-after-field-renames.util';

const EXISTING_FIELDS =
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK.byUniversalIdentifier;

const computeRenamedExpressions = ({
  renamedFieldUniversalIdentifier,
  newFieldName,
  newFieldNameByUniversalIdentifier = new Map([
    [renamedFieldUniversalIdentifier, newFieldName],
  ]),
  ...args
}: Partial<
  Parameters<typeof computeFormulaFieldUpdatesAfterFieldRenames>[0]
> & {
  renamedFieldUniversalIdentifier: string;
  newFieldName: string;
}) =>
  Object.fromEntries(
    Object.entries(
      computeFormulaFieldUpdatesAfterFieldRenames({
        newFieldNameByUniversalIdentifier,
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

const buildStockValueSettings = (priceFieldName: string) => ({
  formula: {
    expression: `sum(gadgets.${priceFieldName}, gadgets.quantity > 0)`,
    bindings: {
      gadgets: 'supplier-gadgets-uid',
      [`gadgets.${priceFieldName}`]: 'gadget-price-uid',
      'gadgets.quantity': 'gadget-quantity-uid',
    },
    evaluation: 'STORED',
  },
});

describe('computeFormulaFieldUpdatesAfterFieldRenames', () => {
  it('should apply every rename of the batch to a formula that reads several renamed fields', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        newFieldName: 'unitPrice',
        newFieldNameByUniversalIdentifier: new Map([
          ['gadget-price-uid', 'unitPrice'],
          ['gadget-quantity-uid', 'units'],
        ]),
      })['gadget-total-uid'],
    ).toEqual({
      formula: {
        expression: 'unitPrice * units',
        bindings: {
          unitPrice: 'gadget-price-uid',
          units: 'gadget-quantity-uid',
        },
      },
    });
  });

  it('should rewrite the formulas of the object that read the renamed field', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        newFieldName: 'unitPrice',
      }),
    ).toEqual({
      'gadget-total-uid': {
        formula: {
          expression: 'unitPrice * quantity',
          bindings: {
            unitPrice: 'gadget-price-uid',
            quantity: 'gadget-quantity-uid',
          },
        },
      },
      'supplier-stock-value-uid': buildStockValueSettings('unitPrice'),
    });
  });

  it('should rewrite the aggregates that read through a renamed one-to-many relation', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'supplier-gadgets-uid',
        newFieldName: 'products',
      }),
    ).toEqual({
      'supplier-gadget-count-uid': {
        formula: {
          expression: 'count(products)',
          bindings: { products: 'supplier-gadgets-uid' },
          evaluation: 'STORED',
        },
      },
      'supplier-stock-value-uid': {
        formula: {
          expression: 'sum(products.price, products.quantity > 0)',
          bindings: {
            products: 'supplier-gadgets-uid',
            'products.price': 'gadget-price-uid',
            'products.quantity': 'gadget-quantity-uid',
          },
          evaluation: 'STORED',
        },
      },
    });
  });

  it('should rewrite lookups and same-object formulas when a field of the related object is renamed', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'supplier-name-uid',
        newFieldName: 'legalName',
      }),
    ).toEqual({
      'supplier-shout-uid': {
        formula: {
          expression: 'legalName || "!"',
          bindings: { legalName: 'supplier-name-uid' },
        },
      },
      'gadget-supplier-label-uid': {
        formula: {
          expression:
            'supplier.legalName || " (" || supplier.revenue.currencyCode || ")"',
          bindings: {
            supplier: 'gadget-supplier-uid',
            'supplier.legalName': 'supplier-name-uid',
            'supplier.revenue': 'supplier-revenue-uid',
          },
        },
      },
    });
  });

  it('should rewrite the relation segment when the relation field is renamed', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-supplier-uid',
        newFieldName: 'vendor',
      }),
    ).toEqual({
      'gadget-supplier-label-uid': {
        formula: {
          expression:
            'vendor.name || " (" || vendor.revenue.currencyCode || ")"',
          bindings: {
            vendor: 'gadget-supplier-uid',
            'vendor.name': 'supplier-name-uid',
            'vendor.revenue': 'supplier-revenue-uid',
          },
        },
      },
      'gadget-commission-uid': {
        formula: {
          expression: 'vendor.revenue.amountMicros * 0.1',
          currencyCodeExpression: 'vendor.revenue.currencyCode',
          bindings: {
            vendor: 'gadget-supplier-uid',
            'vendor.revenue': 'supplier-revenue-uid',
          },
        },
      },
    });
  });

  it('should leave a formula that is deleted in the same build', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        newFieldName: 'unitPrice',
        deletedUniversalFlatFieldMetadataByUniversalIdentifier: {
          'gadget-total-uid': EXISTING_FIELDS['gadget-total-uid'],
        },
      }),
    ).toEqual({
      'supplier-stock-value-uid': buildStockValueSettings('unitPrice'),
    });
  });

  it('should leave formulas untouched when the new name is reserved, but not where it follows a relation', () => {
    expect(
      computeRenamedExpressions({
        renamedFieldUniversalIdentifier: 'gadget-price-uid',
        newFieldName: 'now',
      }),
    ).toEqual({ 'supplier-stock-value-uid': buildStockValueSettings('now') });
  });
});
