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
      settings: { formula: { expression } },
      ...(isUnique === true ? { isUnique } : {}),
    },
    gqlFields: 'id settings',
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

  it('should reject filtering on a formula field', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query {
          formulaGadgets(filter: { total: { gt: 10 } }) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors[0].message).toBe(
      'Field "total" is a formula field and cannot be filtered on',
    );
  });

  it('should reject sorting on a formula field', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query {
          formulaGadgets(orderBy: [{ total: AscNullsLast }]) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors[0].message).toBe(
      'Field "total" is a formula field and cannot be sorted on',
    );
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
      reason: 'a rollup over a to-many relation',
      type: FieldMetadataType.NUMBER,
      expression: 'arrayLength(noteTargets)',
      message: 'Invalid formula: "noteTargets" is not a to-one relation',
    },
    {
      reason: 'a field type that does not support formulas',
      type: FieldMetadataType.CURRENCY,
      expression: 'price',
      message: 'Field type CURRENCY does not support formulas',
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
    const [{ settings }] = await global.testDataSource.query(
      `SELECT "settings" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'total'`,
      [gadgetObjectMetadataId],
    );

    expect(settings.formula).toMatchObject({
      expression: 'unitPrice * quantity',
      bindings: {
        unitPrice: priceUniversalIdentifier,
        quantity: expect.any(String),
      },
    });
  });
});
