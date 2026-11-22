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

  if (plan === undefined) {
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
      ownFieldMetadataIds: ['gadget-price', 'gadget-quantity'],
      ownFieldNames: ['price', 'quantity'],
      ownColumnNames: ['price', 'quantity'],
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
      ownFieldNames: ['supplier'],
      ownColumnNames: ['supplierId'],
      lookups: [
        {
          relationFieldName: 'supplier',
          relationFieldMetadataId: 'gadget-supplier',
          targetObjectMetadataId: 'supplier-object',
          targetFieldMetadataIds: ['supplier-name', 'supplier-revenue'],
          targetFieldNames: ['name', 'revenue'],
          targetColumnNames: [
            'name',
            'revenueAmountMicros',
            'revenueCurrencyCode',
          ],
        },
      ],
    });
  });

  it('should evaluate a formula that no longer compiles to null without reading anything', () => {
    expect(findPlan('broken')).toMatchObject({
      ownColumnNames: [],
      lookups: [],
    });
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
