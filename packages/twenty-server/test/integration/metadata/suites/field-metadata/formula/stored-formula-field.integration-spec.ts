import gql from 'graphql-tag';
import { isNonEmptyString } from '@sniptt/guards';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { getFieldMetadataFormulaEvaluation } from 'twenty-shared/utils';

import { STORED_FORMULA_FIELD_RECOMPUTE_DEBOUNCE_MS } from 'src/engine/core-modules/stored-formula-field/constants/stored-formula-field-recompute-debounce-ms.constant';
import { type StoredFormulaFieldDirtyRecordService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-dirty-record.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SUPPLIER_NAME_SINGULAR = 'storedFormulaSupplier';
const GADGET_NAME_SINGULAR = 'storedFormulaGadget';
const SUPPLIER_GQL_FIELDS =
  'gadgetCount stockValue lastReleasedAt averagePrice weightedCount';

describe('Stored formula fields', () => {
  let supplierObjectMetadataId: string;
  let gadgetObjectMetadataId: string;
  let firstSupplierId: string;
  let secondSupplierId: string;
  let firstGadgetId: string;

  const createObject = async (nameSingular: string): Promise<string> => {
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

  const createField = async ({
    objectMetadataId,
    name,
    type,
    expression,
  }: {
    objectMetadataId: string;
    name: string;
    type: FieldMetadataType;
    expression?: string;
  }) => {
    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name,
        label: name,
        type,
        objectMetadataId,
        isLabelSyncedWithName: false,
        ...(isNonEmptyString(expression) ? { formula: { expression } } : {}),
      },
      gqlFields: 'id formula',
    });

    return createOneField;
  };

  const runGraphqlOperation = async ({
    query,
    variables = {},
  }: {
    query: string;
    variables?: Record<string, unknown>;
  }) => {
    const response = await makeGraphqlApiRequest({
      query: gql(query),
      variables,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data;
  };

  const createGadget = async (data: Record<string, unknown>) =>
    (
      await runGraphqlOperation({
        query: `mutation CreateGadget($data: StoredFormulaGadgetCreateInput!) {
          createStoredFormulaGadget(data: $data) { id }
        }`,
        variables: { data },
      })
    ).createStoredFormulaGadget.id;

  const updateGadget = ({
    id,
    data,
  }: {
    id: string;
    data: Record<string, unknown>;
  }) =>
    runGraphqlOperation({
      query: `mutation UpdateGadget($id: UUID!, $data: StoredFormulaGadgetUpdateInput!) {
        updateStoredFormulaGadget(id: $id, data: $data) { id }
      }`,
      variables: { id, data },
    });

  const readSupplierWithoutWaiting = async (id: string) =>
    (
      await runGraphqlOperation({
        query: `query FindSupplier($id: UUID!) {
          storedFormulaSupplier(filter: { id: { eq: $id } }) { ${SUPPLIER_GQL_FIELDS} }
        }`,
        variables: { id },
      })
    ).storedFormulaSupplier;

  const findSupplier = async (id: string) => {
    await waitForAllJobsToFinish();

    return readSupplierWithoutWaiting(id);
  };

  beforeAll(async () => {
    supplierObjectMetadataId = await createObject(SUPPLIER_NAME_SINGULAR);
    gadgetObjectMetadataId = await createObject(GADGET_NAME_SINGULAR);

    for (const [name, type] of [
      ['price', FieldMetadataType.NUMBER],
      ['quantity', FieldMetadataType.NUMBER],
      ['releasedAt', FieldMetadataType.DATE_TIME],
    ] as const) {
      await createField({
        objectMetadataId: gadgetObjectMetadataId,
        name,
        type,
      });
    }

    await createField({
      objectMetadataId: supplierObjectMetadataId,
      name: 'weight',
      type: FieldMetadataType.NUMBER,
    });

    await createRelationBetweenObjects({
      objectMetadataId: gadgetObjectMetadataId,
      targetObjectMetadataId: supplierObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'supplier',
      label: 'Supplier',
      targetFieldLabel: 'Gadgets',
    });

    firstSupplierId = (
      await runGraphqlOperation({
        query: `mutation { createStoredFormulaSupplier(data: { name: "Acme", weight: 2 }) { id } }`,
      })
    ).createStoredFormulaSupplier.id;
    secondSupplierId = (
      await runGraphqlOperation({
        query: `mutation { createStoredFormulaSupplier(data: { name: "Globex" }) { id } }`,
      })
    ).createStoredFormulaSupplier.id;

    // Created before the formulas, so their first values come from the backfill
    firstGadgetId = await createGadget({
      name: 'Widget',
      price: 10,
      quantity: 2,
      releasedAt: '2026-01-15T10:00:00.000Z',
      supplierId: firstSupplierId,
    });
    await createGadget({
      name: 'Sprocket',
      price: 5,
      quantity: 0,
      releasedAt: '2026-03-01T10:00:00.000Z',
      supplierId: firstSupplierId,
    });

    const gadgetCountField = await createField({
      objectMetadataId: supplierObjectMetadataId,
      name: 'gadgetCount',
      type: FieldMetadataType.NUMBER,
      expression: 'count(gadgets)',
    });

    expect(getFieldMetadataFormulaEvaluation(gadgetCountField)).toBe('STORED');

    await createField({
      objectMetadataId: supplierObjectMetadataId,
      name: 'stockValue',
      type: FieldMetadataType.NUMBER,
      expression: 'sum(gadgets.price, gadgets.quantity > 0)',
    });
    await createField({
      objectMetadataId: supplierObjectMetadataId,
      name: 'lastReleasedAt',
      type: FieldMetadataType.DATE_TIME,
      expression: 'max(gadgets.releasedAt)',
    });
    await createField({
      objectMetadataId: supplierObjectMetadataId,
      name: 'weightedCount',
      type: FieldMetadataType.NUMBER,
      expression: 'count(gadgets) * weight',
    });

    const averagePriceField = await createField({
      objectMetadataId: supplierObjectMetadataId,
      name: 'averagePrice',
      type: FieldMetadataType.NUMBER,
      expression: 'stockValue / gadgetCount',
    });

    expect(getFieldMetadataFormulaEvaluation(averagePriceField)).toBe(
      'QUERY_TIME',
    );
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      gadgetObjectMetadataId,
      supplierObjectMetadataId,
    ]) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    }
  });

  it('should backfill the stored formulas of existing records, and read them from a query-time formula', async () => {
    expect(await findSupplier(firstSupplierId)).toEqual({
      gadgetCount: 2,
      stockValue: 10,
      lastReleasedAt: '2026-03-01T10:00:00.000Z',
      weightedCount: 4,
      averagePrice: 5,
    });
    expect(await findSupplier(secondSupplierId)).toMatchObject({
      gadgetCount: 0,
      stockValue: null,
      lastReleasedAt: null,
    });
  });

  it('should recompute when a related record is created', async () => {
    await createGadget({
      name: 'Gizmo',
      price: 7,
      quantity: 1,
      supplierId: secondSupplierId,
    });

    expect(await findSupplier(secondSupplierId)).toMatchObject({
      gadgetCount: 1,
      stockValue: 7,
    });
  });

  it('should recompute when an aggregated or filtered field changes', async () => {
    await updateGadget({ id: firstGadgetId, data: { price: 20 } });

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      stockValue: 20,
    });

    await updateGadget({ id: firstGadgetId, data: { quantity: 0 } });

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      stockValue: null,
    });
  });

  it('should recompute when a field of the record itself changes', async () => {
    await runGraphqlOperation({
      query: `mutation UpdateSupplier($id: UUID!) {
        updateStoredFormulaSupplier(id: $id, data: { weight: 3 }) { id }
      }`,
      variables: { id: firstSupplierId },
    });

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      weightedCount: 6,
    });
  });

  it('should recompute both records when a related record moves', async () => {
    await updateGadget({
      id: firstGadgetId,
      data: { supplierId: secondSupplierId },
    });

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      gadgetCount: 1,
    });
    expect(await findSupplier(secondSupplierId)).toMatchObject({
      gadgetCount: 2,
    });
  });

  it('should leave out a deleted related record, count it again once restored, and leave out a destroyed one', async () => {
    const filter = { id: { in: [firstGadgetId] } };

    await runGraphqlOperation({
      query: `mutation DeleteGadgets($filter: StoredFormulaGadgetFilterInput!) {
        deleteStoredFormulaGadgets(filter: $filter) { id }
      }`,
      variables: { filter },
    });

    expect(await findSupplier(secondSupplierId)).toMatchObject({
      gadgetCount: 1,
    });

    await runGraphqlOperation({
      query: `mutation RestoreGadgets($filter: StoredFormulaGadgetFilterInput!) {
        restoreStoredFormulaGadgets(filter: $filter) { id }
      }`,
      variables: { filter },
    });

    expect(await findSupplier(secondSupplierId)).toMatchObject({
      gadgetCount: 2,
    });

    await runGraphqlOperation({
      query: `mutation DeleteGadgets($filter: StoredFormulaGadgetFilterInput!) {
        deleteStoredFormulaGadgets(filter: $filter) { id }
      }`,
      variables: { filter },
    });
    await runGraphqlOperation({
      query: `mutation DestroyGadgets($filter: StoredFormulaGadgetFilterInput!) {
        destroyStoredFormulaGadgets(filter: $filter) { id }
      }`,
      variables: { filter },
    });

    expect(await findSupplier(secondSupplierId)).toMatchObject({
      gadgetCount: 1,
    });
  });

  it('should recompute a record whose previous recompute died after taking it', async () => {
    await createGadget({
      name: 'Doohickey',
      price: 3,
      quantity: 1,
      supplierId: firstSupplierId,
    });

    const takenRecordIds =
      await getAppProviderByClassName<StoredFormulaFieldDirtyRecordService>(
        'StoredFormulaFieldDirtyRecordService',
      ).popDirtyRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: supplierObjectMetadataId,
        size: 100,
      });

    expect(takenRecordIds).toContain(firstSupplierId);
    expect(await findSupplier(firstSupplierId)).toMatchObject({
      gadgetCount: 2,
    });
  });

  it('should recompute a record marked dirty while another recompute is running', async () => {
    const storedFormulaFieldDirtyRecordService =
      getAppProviderByClassName<StoredFormulaFieldDirtyRecordService>(
        'StoredFormulaFieldDirtyRecordService',
      );
    const runScope = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId: supplierObjectMetadataId,
    };

    expect(
      await storedFormulaFieldDirtyRecordService.acquireRecomputeRun(runScope),
    ).toBe(true);

    try {
      await createGadget({
        name: 'Gizmo',
        price: 1,
        quantity: 0,
        supplierId: firstSupplierId,
      });

      // Lets the scheduled recompute run into the held lock and reschedule itself
      await new Promise((resolve) =>
        setTimeout(resolve, STORED_FORMULA_FIELD_RECOMPUTE_DEBOUNCE_MS * 2),
      );

      expect(await readSupplierWithoutWaiting(firstSupplierId)).toMatchObject({
        gadgetCount: 2,
      });
    } finally {
      await storedFormulaFieldDirtyRecordService.releaseRecomputeRun(runScope);
    }

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      gadgetCount: 3,
    });
  });

  it('should leave a record untouched when its recompute finds nothing stale', async () => {
    const readSupplierUpdatedAt = async () => {
      await waitForAllJobsToFinish();

      return (
        await runGraphqlOperation({
          query: `query FindSupplier($id: UUID!) {
            storedFormulaSupplier(filter: { id: { eq: $id } }) { updatedAt }
          }`,
          variables: { id: secondSupplierId },
        })
      ).storedFormulaSupplier.updatedAt;
    };
    const updatedAtBeforeRecompute = await readSupplierUpdatedAt();

    await getAppProviderByClassName<StoredFormulaFieldDirtyRecordService>(
      'StoredFormulaFieldDirtyRecordService',
    ).markRecordsDirty({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId: supplierObjectMetadataId,
      recordIds: [secondSupplierId],
    });

    expect(await readSupplierUpdatedAt()).toBe(updatedAtBeforeRecompute);
  });

  it('should backfill again when the expression changes', async () => {
    const [{ id: gadgetCountFieldMetadataId }] =
      await global.testDataSource.query(
        `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'gadgetCount'`,
        [supplierObjectMetadataId],
      );

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: gadgetCountFieldMetadataId,
        updatePayload: {
          formula: { expression: 'count(gadgets, gadgets.quantity > 0)' },
        },
      },
      gqlFields: 'id',
    });

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      gadgetCount: 1,
    });
  });

  it('should backfill a query-time formula once an edit makes it stored', async () => {
    const [{ id: averagePriceFieldMetadataId }] =
      await global.testDataSource.query(
        `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'averagePrice'`,
        [supplierObjectMetadataId],
      );

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: averagePriceFieldMetadataId,
        updatePayload: {
          formula: { expression: 'count(gadgets, gadgets.quantity > 0)' },
        },
      },
      gqlFields: 'id',
    });

    expect(await findSupplier(firstSupplierId)).toMatchObject({
      averagePrice: 1,
    });
  });
});
