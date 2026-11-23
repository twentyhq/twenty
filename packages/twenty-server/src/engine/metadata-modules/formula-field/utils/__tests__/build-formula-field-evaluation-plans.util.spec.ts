import { isDefined } from 'twenty-shared/utils';

import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
  FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
  FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { buildFormulaFieldEvaluationPlans } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-evaluation-plans.util';

const NOW = '2026-09-23T10:00:00.000Z';

const buildPlans = () =>
  buildFormulaFieldEvaluationPlans({
    flatObjectMetadata: FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
    flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  });

const findPlan = (fieldName: string) => {
  const plan = buildPlans().find(
    (candidate) => candidate.fieldName === fieldName,
  );

  if (!isDefined(plan)) {
    throw new Error(`No plan for ${fieldName}`);
  }

  return plan;
};

describe('buildFormulaFieldEvaluationPlans', () => {
  it('should plan one evaluation per formula field', () => {
    expect(buildPlans().map(({ fieldName }) => fieldName)).toEqual([
      'total',
      'supplierLabel',
      'broken',
    ]);
  });

  it('should list the columns a formula reads on its own record', () => {
    expect(findPlan('total')).toMatchObject({
      ownFields: [
        {
          fieldMetadataId: 'gadget-price',
          fieldName: 'price',
          columnNames: ['price'],
        },
        {
          fieldMetadataId: 'gadget-quantity',
          fieldName: 'quantity',
          columnNames: ['quantity'],
        },
      ],
      lookups: [],
    });
    expect(
      findPlan('total').evaluate({
        record: { price: 12.5, quantity: 4 },
        now: NOW,
      }),
    ).toBe(50);
  });

  it('should list the related record columns a lookup reads', () => {
    expect(findPlan('supplierLabel')).toMatchObject({
      ownFields: [
        {
          fieldMetadataId: 'gadget-supplier',
          fieldName: 'supplier',
          columnNames: ['supplierId'],
        },
      ],
      lookups: [
        {
          relationFieldName: 'supplier',
          targetObjectMetadataId: 'supplier-object',
          targetFields: [
            {
              fieldMetadataId: 'supplier-name',
              fieldName: 'name',
              columnNames: ['name'],
            },
            {
              fieldMetadataId: 'supplier-revenue',
              fieldName: 'revenue',
              columnNames: ['revenueAmountMicros', 'revenueCurrencyCode'],
            },
          ],
        },
      ],
    });
    expect(
      findPlan('supplierLabel').evaluate({
        record: {
          supplier: { name: 'Acme', revenue: { currencyCode: 'USD' } },
        },
        now: NOW,
      }),
    ).toBe('Acme (USD)');
  });

  it('should evaluate a formula that no longer compiles to null without reading anything', () => {
    expect(findPlan('broken')).toMatchObject({ ownFields: [], lookups: [] });
    expect(findPlan('broken').evaluate({ record: {}, now: NOW })).toBeNull();
  });

  it('should plan nothing for an object without formula fields', () => {
    expect(
      buildFormulaFieldEvaluationPlans({
        flatObjectMetadata: {
          ...FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
          fieldIds: ['supplier-name', 'supplier-revenue'],
        },
        flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      }),
    ).toEqual([]);
  });
});
