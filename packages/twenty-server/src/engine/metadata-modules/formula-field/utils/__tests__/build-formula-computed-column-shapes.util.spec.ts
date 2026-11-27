import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
  FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
  FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { buildFormulaComputedColumnShapes } from 'src/engine/metadata-modules/formula-field/utils/build-formula-computed-column-shapes.util';

const buildGadgetShapes = () =>
  buildFormulaComputedColumnShapes({
    flatObjectMetadata: FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
    flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
    schemaName: 'workspace',
  });

describe('buildFormulaComputedColumnShapes', () => {
  it('should compute a formula over the record from its stored columns', () => {
    const { computedColumnShapes } = buildGadgetShapes();

    expect(
      computedColumnShapes.find(({ columnName }) => columnName === 'total'),
    ).toEqual({
      columnName: 'total',
      sqlType: 'float',
      expression: expect.stringContaining(
        '(COALESCE("record"."price"::numeric, 0) * COALESCE("record"."quantity"::numeric, 0))',
      ),
      dependencies: [
        { alias: 'record', fieldMetadataId: 'gadget-price' },
        { alias: 'record', fieldMetadataId: 'gadget-quantity' },
      ],
    });
  });

  it('should read a lookup through one alias per relation and depend on the relation and the target field', () => {
    const { computedColumnShapes, computedLookupShapes } = buildGadgetShapes();

    expect(computedLookupShapes).toEqual([
      { alias: 'lookup0', relationFieldName: 'supplier' },
    ]);
    expect(
      computedColumnShapes.find(
        ({ columnName }) => columnName === 'supplierLabel',
      ),
    ).toEqual({
      columnName: 'supplierLabel',
      sqlType: 'text',
      expression: `(((COALESCE("lookup0"."name", '') || ' ('::text) || COALESCE("lookup0"."revenueCurrencyCode", '')) || ')'::text)`,
      dependencies: [
        { alias: 'record', fieldMetadataId: 'gadget-supplier' },
        { alias: 'lookup0', fieldMetadataId: 'supplier-name' },
        { alias: 'lookup0', fieldMetadataId: 'supplier-revenue' },
      ],
    });
  });

  it('should compute one column per stored column of a currency formula', () => {
    const { computedColumnShapes } = buildGadgetShapes();

    expect(
      computedColumnShapes
        .filter(({ columnName }) => columnName.startsWith('commission'))
        .map(({ columnName, sqlType }) => ({ columnName, sqlType })),
    ).toEqual([
      { columnName: 'commissionAmountMicros', sqlType: 'numeric' },
      { columnName: 'commissionCurrencyCode', sqlType: 'text' },
    ]);
  });

  it('should leave a formula that no longer compiles without expression', () => {
    const { computedColumnShapes } = buildGadgetShapes();

    expect(
      computedColumnShapes.find(({ columnName }) => columnName === 'broken'),
    ).toEqual({
      columnName: 'broken',
      sqlType: 'float',
      expression: undefined,
      dependencies: [],
    });
  });

  it('should leave stored formulas to their column', () => {
    const { computedColumnShapes, computedLookupShapes } =
      buildFormulaComputedColumnShapes({
        flatObjectMetadata: FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
        flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
        flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
        schemaName: 'workspace',
      });

    expect(computedLookupShapes).toEqual([]);
    expect(computedColumnShapes.map(({ columnName }) => columnName)).toEqual([
      'shout',
      'checkedAt',
    ]);
  });

  it('should read a query-time formula as its expression, so it depends on what that formula reads', () => {
    const { computedColumnShapes } = buildGadgetShapes();

    expect(
      computedColumnShapes.find(
        ({ columnName }) => columnName === 'doubleTotal',
      ),
    ).toEqual({
      columnName: 'doubleTotal',
      sqlType: 'float',
      expression: expect.stringContaining(
        '(COALESCE("record"."price"::numeric, 0) * COALESCE("record"."quantity"::numeric, 0))',
      ),
      dependencies: [
        { alias: 'record', fieldMetadataId: 'gadget-price' },
        { alias: 'record', fieldMetadataId: 'gadget-quantity' },
      ],
    });
  });

  it('should read a looked-up query-time formula as its expression over the looked-up record', () => {
    const { computedColumnShapes } = buildGadgetShapes();

    expect(
      computedColumnShapes.find(
        ({ columnName }) => columnName === 'supplierShout',
      ),
    ).toEqual({
      columnName: 'supplierShout',
      sqlType: 'text',
      expression: `(COALESCE("lookup0"."name", '') || '!'::text)`,
      dependencies: [
        { alias: 'record', fieldMetadataId: 'gadget-supplier' },
        { alias: 'lookup0', fieldMetadataId: 'supplier-name' },
      ],
    });
  });
});
