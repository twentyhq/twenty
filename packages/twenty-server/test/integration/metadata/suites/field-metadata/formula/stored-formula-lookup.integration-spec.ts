import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { getFieldMetadataFormulaEvaluation } from 'twenty-shared/utils';

describe('Stored formula fields reading a to-one lookup', () => {
  let regionObjectMetadataId: string;
  let supplierObjectMetadataId: string;
  let gadgetObjectMetadataId: string;
  let northRegionId: string;
  let southRegionId: string;
  let supplierId: string;

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

  const createObject = async (nameSingular: string): Promise<string> =>
    (
      await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular,
          namePlural: `${nameSingular}s`,
          labelSingular: nameSingular,
          labelPlural: `${nameSingular}s`,
          icon: 'IconBox',
          isLabelSyncedWithName: false,
        },
      })
    ).data.createOneObject.id;

  const createRegion = async (rate: number): Promise<string> =>
    (
      await runGraphqlOperation({
        query: `mutation CreateRegion($data: LookupFormulaRegionCreateInput!) {
          createLookupFormulaRegion(data: $data) { id }
        }`,
        variables: { data: { rate } },
      })
    ).createLookupFormulaRegion.id;

  const updateRecord = ({
    objectName,
    id,
    data,
  }: {
    objectName: 'LookupFormulaRegion' | 'LookupFormulaSupplier';
    id: string;
    data: Record<string, unknown>;
  }) =>
    runGraphqlOperation({
      query: `mutation Update($id: UUID!, $data: ${objectName}UpdateInput!) {
        update${objectName}(id: $id, data: $data) { id }
      }`,
      variables: { id, data },
    });

  const findRegionWeightedCount = async (): Promise<number | null> => {
    await waitForAllJobsToFinish();

    return (
      await runGraphqlOperation({
        query: `query FindSupplier($id: UUID!) {
          lookupFormulaSupplier(filter: { id: { eq: $id } }) { regionWeightedCount }
        }`,
        variables: { id: supplierId },
      })
    ).lookupFormulaSupplier.regionWeightedCount;
  };

  beforeAll(async () => {
    regionObjectMetadataId = await createObject('lookupFormulaRegion');
    supplierObjectMetadataId = await createObject('lookupFormulaSupplier');
    gadgetObjectMetadataId = await createObject('lookupFormulaGadget');

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'rate',
        label: 'rate',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: regionObjectMetadataId,
        isLabelSyncedWithName: false,
      },
    });
    await createRelationBetweenObjects({
      objectMetadataId: supplierObjectMetadataId,
      targetObjectMetadataId: regionObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'region',
      label: 'Region',
      targetFieldLabel: 'Suppliers',
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

    northRegionId = await createRegion(3);
    southRegionId = await createRegion(1);
    supplierId = (
      await runGraphqlOperation({
        query: `mutation CreateSupplier($data: LookupFormulaSupplierCreateInput!) {
          createLookupFormulaSupplier(data: $data) { id }
        }`,
        variables: { data: { name: 'Acme', regionId: northRegionId } },
      })
    ).createLookupFormulaSupplier.id;

    for (const name of ['Widget', 'Sprocket']) {
      await runGraphqlOperation({
        query: `mutation CreateGadget($data: LookupFormulaGadgetCreateInput!) {
          createLookupFormulaGadget(data: $data) { id }
        }`,
        variables: { data: { name, supplierId } },
      });
    }

    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'regionWeightedCount',
        label: 'regionWeightedCount',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: supplierObjectMetadataId,
        isLabelSyncedWithName: false,
        formula: { expression: 'count(gadgets) * region.rate' },
      },
      gqlFields: 'id formula',
    });

    expect(getFieldMetadataFormulaEvaluation(createOneField)).toBe('STORED');
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      gadgetObjectMetadataId,
      supplierObjectMetadataId,
      regionObjectMetadataId,
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

  it('should backfill a stored formula reading the looked-up record', async () => {
    expect(await findRegionWeightedCount()).toBe(6);
  });

  it('should recompute when a field of the looked-up record changes', async () => {
    await updateRecord({
      objectName: 'LookupFormulaRegion',
      id: northRegionId,
      data: { rate: 5 },
    });

    expect(await findRegionWeightedCount()).toBe(10);
  });

  it('should recompute when the record points to another looked-up record', async () => {
    await updateRecord({
      objectName: 'LookupFormulaSupplier',
      id: supplierId,
      data: { regionId: southRegionId },
    });

    expect(await findRegionWeightedCount()).toBe(2);
  });

  it('should read a deleted looked-up record as empty, and read it again once restored', async () => {
    await runGraphqlOperation({
      query: `mutation { deleteLookupFormulaRegion(id: "${southRegionId}") { id } }`,
    });

    // An empty number counts as 0 in a formula
    expect(await findRegionWeightedCount()).toBe(0);

    await runGraphqlOperation({
      query: `mutation { restoreLookupFormulaRegion(id: "${southRegionId}") { id } }`,
    });

    expect(await findRegionWeightedCount()).toBe(2);
  });
});
