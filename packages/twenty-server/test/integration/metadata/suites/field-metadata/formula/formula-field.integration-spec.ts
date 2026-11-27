import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const SUPPLIER_NAME_SINGULAR = 'formulaSupplier';
const GADGET_NAME_SINGULAR = 'formulaGadget';

const createFormulaField = ({
  objectMetadataId,
  name,
  type,
  expression,
  expectToFail = false,
  isUnique,
}: {
  objectMetadataId: string;
  name: string;
  type: FieldMetadataType;
  expression: string;
  expectToFail?: boolean;
  isUnique?: boolean;
}) =>
  createOneFieldMetadata({
    expectToFail,
    input: {
      name,
      label: name,
      type,
      objectMetadataId,
      isLabelSyncedWithName: false,
      formula: { expression },
      ...(isUnique ? { isUnique } : {}),
    },
    gqlFields: 'id formula',
  });

describe('Formula fields', () => {
  let supplierObjectMetadataId: string;
  let gadgetObjectMetadataId: string;
  let priceFieldMetadataId: string;
  let supplierId: string;
  let gadgetId: string;

  const findGadget = async (gqlFields: string) => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query FormulaGadget($id: UUID!) {
          formulaGadget(filter: { id: { eq: $id } }) {
            ${gqlFields}
          }
        }
      `,
      variables: { id: gadgetId },
    });

    return response.body.data.formulaGadget;
  };

  beforeAll(async () => {
    const createObject = async (nameSingular: string) => {
      const {
        data: {
          createOneObject: { id },
        },
      } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular,
          namePlural: `${nameSingular}s`,
          labelSingular: nameSingular,
          labelPlural: `${nameSingular}s`,
          icon: 'IconBox',
          isLabelSyncedWithName: false,
        },
      });

      return id;
    };

    supplierObjectMetadataId = await createObject(SUPPLIER_NAME_SINGULAR);
    gadgetObjectMetadataId = await createObject(GADGET_NAME_SINGULAR);

    for (const name of ['price', 'quantity']) {
      const {
        data: {
          createOneField: { id },
        },
      } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          name,
          label: name,
          type: FieldMetadataType.NUMBER,
          objectMetadataId: gadgetObjectMetadataId,
          isLabelSyncedWithName: false,
        },
        gqlFields: 'id',
      });

      if (name === 'price') {
        priceFieldMetadataId = id;
      }
    }

    await createRelationBetweenObjects({
      objectMetadataId: gadgetObjectMetadataId,
      targetObjectMetadataId: supplierObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'supplier',
      label: 'Supplier',
      targetFieldLabel: 'Gadgets',
    });

    await createFormulaField({
      objectMetadataId: gadgetObjectMetadataId,
      name: 'total',
      type: FieldMetadataType.NUMBER,
      expression: 'price * quantity',
    });
    await createFormulaField({
      objectMetadataId: gadgetObjectMetadataId,
      name: 'supplierLabel',
      type: FieldMetadataType.TEXT,
      expression: 'supplier.name || " gadget"',
    });
    await createFormulaField({
      objectMetadataId: gadgetObjectMetadataId,
      name: 'isExpensive',
      type: FieldMetadataType.BOOLEAN,
      expression: 'price * quantity > 100',
    });

    const supplierResponse = await makeGraphqlApiRequest({
      query: gql`
        mutation {
          createFormulaSupplier(data: { name: "Acme" }) {
            id
          }
        }
      `,
    });

    supplierId = supplierResponse.body.data.createFormulaSupplier.id;

    const gadgetResponse = await makeGraphqlApiRequest({
      query: gql`
        mutation CreateFormulaGadget($supplierId: UUID!) {
          createFormulaGadget(
            data: {
              name: "Widget"
              price: 12.5
              quantity: 4
              supplierId: $supplierId
            }
          ) {
            id
            total
            supplierLabel
            isExpensive
          }
        }
      `,
      variables: { supplierId },
    });

    expect(gadgetResponse.body.errors).toBeUndefined();
    expect(gadgetResponse.body.data.createFormulaGadget).toMatchObject({
      total: 50,
      supplierLabel: 'Acme gadget',
      isExpensive: false,
    });

    gadgetId = gadgetResponse.body.data.createFormulaGadget.id;
  }, 120000);

  afterAll(async () => {
    for (const idToDelete of [
      gadgetObjectMetadataId,
      supplierObjectMetadataId,
    ]) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete },
      });
    }
  }, 120000);

  it('should compute a formula when only the formula field is selected', async () => {
    expect(await findGadget('total supplierLabel isExpensive')).toEqual({
      total: 50,
      supplierLabel: 'Acme gadget',
      isExpensive: false,
    });
  });

  it('should not expose the values a formula read when they were not selected', async () => {
    expect(await findGadget('id supplierLabel')).toEqual({
      id: gadgetId,
      supplierLabel: 'Acme gadget',
    });
  });

  it('should compute formulas of records read through a relation', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query FormulaSupplier($id: UUID!) {
          formulaSupplier(filter: { id: { eq: $id } }) {
            gadgets {
              edges {
                node {
                  total
                  supplierLabel
                }
              }
            }
          }
        }
      `,
      variables: { id: supplierId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.formulaSupplier.gadgets.edges).toEqual([
      { node: { total: 50, supplierLabel: 'Acme gadget' } },
    ]);
  });

  it('should compute a select option and a rating, and drop a value that is not an option', async () => {
    const options = [
      { label: 'High', value: 'HIGH', color: 'green', position: 0 },
      { label: 'Low', value: 'LOW', color: 'red', position: 1 },
    ];

    for (const { name, type, expression } of [
      {
        name: 'tier',
        type: FieldMetadataType.SELECT,
        expression: 'if(price * quantity > 100, "HIGH", "LOW")',
      },
      {
        name: 'unknownTier',
        type: FieldMetadataType.SELECT,
        expression: '"MEDIUM"',
      },
      {
        name: 'score',
        type: FieldMetadataType.RATING,
        expression: 'if(quantity > 5, 5, 2)',
      },
    ]) {
      await createOneFieldMetadata({
        expectToFail: false,
        input: {
          name,
          label: name,
          type,
          objectMetadataId: gadgetObjectMetadataId,
          isLabelSyncedWithName: false,
          formula: { expression },
          ...(type === FieldMetadataType.SELECT ? { options } : {}),
        },
        gqlFields: 'id formula',
      });
    }

    expect(await findGadget('tier unknownTier score')).toEqual({
      tier: 'LOW',
      unknownTier: null,
      score: 'RATING_2',
    });
  });

  it('should compute a currency from an amount and a currency code expression', async () => {
    const buildCurrencyFormulaInput = ({
      name,
      formula,
    }: {
      name: string;
      formula: { expression: string; currencyCodeExpression?: string };
    }) => ({
      name,
      label: name,
      type: FieldMetadataType.CURRENCY,
      objectMetadataId: gadgetObjectMetadataId,
      isLabelSyncedWithName: false,
      formula,
    });

    await createOneFieldMetadata({
      expectToFail: false,
      input: buildCurrencyFormulaInput({
        name: 'totalValue',
        formula: {
          expression: 'price * quantity * 1000000',
          currencyCodeExpression: 'if(quantity > 100, "EUR", "USD")',
        },
      }),
      gqlFields: 'id formula',
    });
    await createOneFieldMetadata({
      expectToFail: false,
      input: buildCurrencyFormulaInput({
        name: 'unknownCurrencyValue',
        formula: {
          expression: 'price * 1000000',
          currencyCodeExpression: '"NOPE"',
        },
      }),
      gqlFields: 'id',
    });

    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: buildCurrencyFormulaInput({
        name: 'valueWithoutCurrency',
        formula: {
          expression: 'price * 1000000',
        },
      }),
      gqlFields: 'id',
    });

    expect(JSON.stringify(errors)).toContain(
      'A currency formula needs a currency code expression',
    );
    expect(
      await findGadget(
        'totalValue { amountMicros currencyCode } unknownCurrencyValue { amountMicros currencyCode }',
      ),
    ).toEqual({
      totalValue: { amountMicros: 50000000, currencyCode: 'USD' },
      unknownCurrencyValue: { amountMicros: null, currencyCode: null },
    });
    expect(await findGadget('totalValue { currencyCode }')).toEqual({
      totalValue: { currencyCode: 'USD' },
    });
  });

  it('should compute formulas through the REST API', async () => {
    const response = await makeRestApiRequest({
      method: 'get',
      path: `/formulaGadgets/${gadgetId}`,
    });

    expect(response.body.data.formulaGadget).toMatchObject({
      total: 50,
      supplierLabel: 'Acme gadget',
      isExpensive: false,
    });
  });

  it('should compute formulas of grouped records', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query {
          formulaGadgetsGroupBy(groupBy: [{ name: true }]) {
            groupByDimensionValues
            edges {
              node {
                total
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.formulaGadgetsGroupBy).toEqual([
      {
        groupByDimensionValues: ['Widget'],
        edges: [{ node: { total: 50 } }],
      },
    ]);
  });

  it('should return the recomputed value from the mutation that changes an input', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation UpdateFormulaGadget($id: UUID!) {
          updateFormulaGadget(id: $id, data: { quantity: 10 }) {
            total
            isExpensive
          }
        }
      `,
      variables: { id: gadgetId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateFormulaGadget).toEqual({
      total: 125,
      isExpensive: true,
    });
  });

  it('should read a lookup as empty when the related record is missing', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation {
          createFormulaGadget(data: { name: "Orphan", price: 1, quantity: 1 }) {
            total
            supplierLabel
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createFormulaGadget).toEqual({
      total: 1,
      supplierLabel: ' gadget',
    });
  });

  it('should reject writing a formula field', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation UpdateFormulaGadget($id: UUID!) {
          updateFormulaGadget(id: $id, data: { total: 3 }) {
            id
          }
        }
      `,
      variables: { id: gadgetId },
    });

    expect(response.body.errors[0].message).toBe(
      'total is a formula field and does not support write operations',
    );
  });

  const findGadgetNames = async (queryArguments: string) => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query {
          formulaGadgets(${queryArguments}) {
            edges {
              node {
                name
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.formulaGadgets.edges.map(
      ({ node }: { node: { name: string } }) => node.name,
    );
  };

  it('should filter on formula fields, including one read through a lookup', async () => {
    expect(await findGadgetNames('filter: { total: { gt: 10 } }')).toEqual([
      'Widget',
    ]);
    expect(
      await findGadgetNames('filter: { supplierLabel: { like: "Acme%" } }'),
    ).toEqual(['Widget']);
    expect(
      await findGadgetNames('filter: { isExpensive: { eq: false } }'),
    ).toEqual(['Orphan']);
    expect(
      await findGadgetNames(
        'filter: { or: [{ total: { lt: 10 } }, { isExpensive: { eq: true } }] }, orderBy: [{ name: AscNullsLast }]',
      ),
    ).toEqual(['Orphan', 'Widget']);
  });

  it('should sort on a formula field', async () => {
    expect(await findGadgetNames('orderBy: [{ total: AscNullsLast }]')).toEqual(
      ['Orphan', 'Widget'],
    );
    expect(
      await findGadgetNames('orderBy: [{ total: DescNullsLast }]'),
    ).toEqual(['Widget', 'Orphan']);
    expect(
      await findGadgetNames('orderBy: [{ isExpensive: DescNullsLast }]'),
    ).toEqual(['Widget', 'Orphan']);
  });

  it('should aggregate a formula field', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query {
          formulaGadgets(filter: { total: { gt: 0 } }) {
            totalCount
            sumTotal
            avgTotal
            minTotal
            maxTotal
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.formulaGadgets).toEqual({
      totalCount: 2,
      sumTotal: 126,
      avgTotal: 63,
      minTotal: 1,
      maxTotal: 125,
    });
  });

  it('should group records by a formula field', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query {
          formulaGadgetsGroupBy(
            groupBy: [{ isExpensive: true }]
            orderBy: [{ isExpensive: AscNullsLast }]
          ) {
            groupByDimensionValues
            totalCount
            sumTotal
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.formulaGadgetsGroupBy).toEqual([
      { groupByDimensionValues: [false], totalCount: 1, sumTotal: 1 },
      { groupByDimensionValues: [true], totalCount: 1, sumTotal: 125 },
    ]);
  });

  it('should filter records by the formula of their related records', async () => {
    const findSupplierNames = async (minimumTotal: number) => {
      const response = await makeGraphqlApiRequest({
        query: gql`
          query FormulaSuppliers($minimumTotal: Float!) {
            formulaSuppliers(
              filter: { gadgets: { total: { gt: $minimumTotal } } }
            ) {
              edges {
                node {
                  name
                }
              }
            }
          }
        `,
        variables: { minimumTotal },
      });

      expect(response.body.errors).toBeUndefined();

      return response.body.data.formulaSuppliers.edges.map(
        ({ node }: { node: { name: string } }) => node.name,
      );
    };

    expect(await findSupplierNames(100)).toEqual(['Acme']);
    expect(await findSupplierNames(1000)).toEqual([]);
  });

  it('should only write the records a formula filter matches', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation {
          updateFormulaGadgets(
            filter: { total: { lt: 10 } }
            data: { quantity: 3 }
          ) {
            name
            total
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateFormulaGadgets).toEqual([
      { name: 'Orphan', total: 3 },
    ]);
  });

  it('should write the records whose filter compares to a formula through a field reference', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation UpdateFormulaGadgets($id: UUID!) {
          updateFormulaGadgets(
            filter: { id: { eq: $id }, price: { ltField: "total" } }
            data: { name: "Widget" }
          ) {
            name
          }
        }
      `,
      variables: { id: gadgetId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateFormulaGadgets).toEqual([
      { name: 'Widget' },
    ]);
  });

  it.each([
    {
      reason: 'an unknown field',
      type: FieldMetadataType.NUMBER,
      expression: 'revenue * 2',
      message: 'Invalid formula: Unknown field "revenue"',
    },
    {
      reason: 'another formula field',
      type: FieldMetadataType.NUMBER,
      expression: 'total * 2',
      message: 'Invalid formula: Unknown field "total"',
    },
    {
      reason: 'a to-many relation read outside an aggregate',
      type: FieldMetadataType.NUMBER,
      expression: 'arrayLength(noteTargets)',
      message:
        'Invalid formula: "noteTargets" has many records: read it inside count(), sum(), avg(), min() or max()',
    },
    {
      reason: 'now in a formula that aggregates related records',
      type: FieldMetadataType.NUMBER,
      expression: 'count(noteTargets) + datePart(now, "DAY")',
      message: 'Invalid formula: A stored formula cannot read "now"',
    },
    {
      reason: 'a sum of values that are not numbers',
      type: FieldMetadataType.NUMBER,
      expression: 'sum(noteTargets.id)',
      message: 'Invalid formula: sum() needs a number, but got text',
    },
    {
      reason: 'a value of another type than the field',
      type: FieldMetadataType.NUMBER,
      expression: 'name',
      message: 'Invalid formula: This field needs a number, but got text',
    },
    {
      reason: 'operands of types that cannot be compared',
      type: FieldMetadataType.BOOLEAN,
      expression: 'price > name',
      message: 'Invalid formula: ">" cannot mix a number and text',
    },
    {
      reason: 'a field type that does not support formulas',
      type: FieldMetadataType.LINKS,
      expression: 'price',
      message: 'Field type LINKS does not support formulas',
    },
  ])(
    'should refuse a formula reading $reason',
    async ({ type, expression, message }) => {
      const { errors } = await createFormulaField({
        objectMetadataId: gadgetObjectMetadataId,
        name: 'refused',
        type,
        expression,
        expectToFail: true,
      });

      expect(JSON.stringify(errors)).toContain(
        JSON.stringify(message).slice(1, -1),
      );
    },
  );

  it('should refuse a unique formula field', async () => {
    const { errors } = await createFormulaField({
      objectMetadataId: gadgetObjectMetadataId,
      name: 'refused',
      type: FieldMetadataType.NUMBER,
      expression: 'price',
      expectToFail: true,
      isUnique: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'A formula field cannot be unique',
    );
  });

  it('should keep a formula working when a field it reads is renamed', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: priceFieldMetadataId,
        updatePayload: { name: 'unitPrice' },
      },
      gqlFields: 'id',
    });

    expect(await findGadget('total')).toEqual({ total: 125 });

    const [{ universalIdentifier: priceUniversalIdentifier }] =
      await global.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."fieldMetadata" WHERE "id" = $1`,
        [priceFieldMetadataId],
      );
    const [{ formula }] = await global.testDataSource.query(
      `SELECT "formula" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'total'`,
      [gadgetObjectMetadataId],
    );

    expect(formula.expression).toBeUndefined();
    expect(formula.tree).toMatchObject({
      type: 'ARITHMETIC',
      operator: 'MULTIPLY',
      left: {
        type: 'FIELD',
        fieldUniversalIdentifier: priceUniversalIdentifier,
      },
      right: { type: 'FIELD', fieldUniversalIdentifier: expect.any(String) },
    });
  });

  it('should refuse renaming a field a formula reads to a reserved name', async () => {
    const [{ id: quantityFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'quantity'`,
      [gadgetObjectMetadataId],
    );
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: quantityFieldMetadataId,
        updatePayload: { name: 'now' },
      },
      gqlFields: 'id',
    });

    expect(JSON.stringify(errors)).toContain(
      JSON.stringify(
        'A formula reads this field, so it cannot be named "now"',
      ).slice(1, -1),
    );
    expect(await findGadget('total')).toEqual({ total: 125 });
  });
  it('should keep a formula when only its settings change, and remove it on null', async () => {
    const {
      data: {
        createOneField: { id: doubleQuantityFieldMetadataId },
      },
    } = await createFormulaField({
      objectMetadataId: gadgetObjectMetadataId,
      name: 'doubleQuantity',
      type: FieldMetadataType.NUMBER,
      expression: 'quantity * 2',
    });

    const updateField = (updatePayload: Record<string, unknown>) =>
      updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: doubleQuantityFieldMetadataId, updatePayload },
        gqlFields: 'id settings formula',
      });

    const {
      data: { updateOneField: fieldWithNewSettings },
    } = await updateField({ settings: { decimals: 1 } });

    expect(fieldWithNewSettings).toMatchObject({
      settings: { decimals: 1 },
      formula: {
        tree: {
          type: 'ARITHMETIC',
          operator: 'MULTIPLY',
          right: { type: 'LITERAL', value: 2 },
        },
      },
    });

    const {
      data: { updateOneField: fieldWithoutFormula },
    } = await updateField({ formula: null });

    expect(fieldWithoutFormula).toMatchObject({
      settings: { decimals: 1 },
      formula: null,
    });
  });
});
