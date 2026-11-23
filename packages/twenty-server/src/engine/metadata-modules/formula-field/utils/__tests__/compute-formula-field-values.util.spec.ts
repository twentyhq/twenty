import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';
import { computeFormulaFieldValues } from 'src/engine/metadata-modules/formula-field/utils/compute-formula-field-values.util';

const NOW = '2026-09-23T10:00:00.000Z';

const TOTAL_PLAN: FormulaFieldEvaluationPlan = {
  fieldName: 'total',
  ownFields: [
    { fieldMetadataId: 'price-id', fieldName: 'price', columnNames: ['price'] },
    {
      fieldMetadataId: 'quantity-id',
      fieldName: 'quantity',
      columnNames: ['quantity'],
    },
  ],
  lookups: [],
  evaluate: ({ record }) => Number(record.price) * Number(record.quantity),
};

const SUPPLIER_LABEL_PLAN: FormulaFieldEvaluationPlan = {
  fieldName: 'supplierLabel',
  ownFields: [
    {
      fieldMetadataId: 'supplier-id',
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
      ],
    },
  ],
  evaluate: () => 'Acme gadget',
};

const compute = (record: { id: string } & Record<string, unknown>) =>
  computeFormulaFieldValues({
    record,
    formulaFieldEvaluationPlans: [TOTAL_PLAN, SUPPLIER_LABEL_PLAN],
    now: NOW,
  });

describe('computeFormulaFieldValues', () => {
  it('should compute the selected formula fields only', () => {
    expect(
      compute({ id: 'gadget', total: null, price: 12.5, quantity: 4 }),
    ).toEqual({ id: 'gadget', total: 50, price: 12.5, quantity: 4 });
  });

  it('should return null when a value the formula reads was not loaded', () => {
    expect(compute({ id: 'gadget', total: null, price: 12.5 })).toEqual({
      id: 'gadget',
      total: null,
      price: 12.5,
    });
  });

  it('should return null when a looked up value was not loaded on the related record', () => {
    expect(
      compute({
        id: 'gadget',
        supplierLabel: '',
        supplier: { id: 'supplier' },
      }),
    ).toMatchObject({ supplierLabel: null });
  });

  it('should compute a lookup when the related record is missing', () => {
    expect(
      compute({ id: 'gadget', supplierLabel: '', supplier: null }),
    ).toMatchObject({ supplierLabel: 'Acme gadget' });
  });

  it('should leave a record without selected formula fields untouched', () => {
    const record = { id: 'gadget', price: 12.5 };

    expect(compute(record)).toBe(record);
  });
});
