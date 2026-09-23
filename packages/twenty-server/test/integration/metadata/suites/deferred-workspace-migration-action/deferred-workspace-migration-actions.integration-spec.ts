import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const OBJECT_NAME_SINGULAR = 'deferredGadget';
const SYSTEM_RELATION_OBJECT_NAMES = [
  'attachment',
  'noteTarget',
  'taskTarget',
  'timelineActivity',
];

const findIndexNamesBySystemRelationObjectName = async (): Promise<
  Record<string, string[]>
> => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  return Object.fromEntries(
    SYSTEM_RELATION_OBJECT_NAMES.map((systemRelationObjectName) => [
      systemRelationObjectName,
      (
        objects.find(
          (object) => object.nameSingular === systemRelationObjectName,
        )?.indexMetadataList ?? []
      ).map((index) => index.name),
    ]),
  );
};

describe('Deferred workspace migration actions', () => {
  let objectMetadataId: string;
  let indexNamesBeforeObjectCreation: Record<string, string[]>;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED,
      value: true,
      expectToFail: false,
    });

    indexNamesBeforeObjectCreation =
      await findIndexNamesBySystemRelationObjectName();

    const {
      data: {
        createOneObject: { id },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: `${OBJECT_NAME_SINGULAR}s`,
        labelSingular: 'Deferred gadget',
        labelPlural: 'Deferred gadgets',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = id;
  });

  afterAll(async () => {
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
    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('should add one join column index to every system relation object', async () => {
    const indexNamesAfterObjectCreation =
      await findIndexNamesBySystemRelationObjectName();

    for (const systemRelationObjectName of SYSTEM_RELATION_OBJECT_NAMES) {
      const newIndexNames = indexNamesAfterObjectCreation[
        systemRelationObjectName
      ].filter(
        (indexName) =>
          !indexNamesBeforeObjectCreation[systemRelationObjectName].includes(
            indexName,
          ),
      );

      expect(newIndexNames).toHaveLength(1);
    }
  });

  it('should record timeline activities for records of the new object', async () => {
    const {
      data: { createOneResponse },
    } = await createOneOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      input: { name: 'First deferred gadget' },
    });

    await expectEventually(async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'timelineActivity',
          objectMetadataPluralName: 'timelineActivities',
          gqlFields: 'id',
          filter: { targetDeferredGadgetId: { eq: createOneResponse.id } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.timelineActivities.edges.length,
      ).toBeGreaterThan(0);
    });
  });

  it('should delete a logic function', async () => {
    const { data: createData } = await createOneLogicFunction({
      input: { name: 'Deferred cleanup function' },
      expectToFail: false,
    });

    const logicFunctionId = createData.createOneLogicFunction.id;

    const { data: deleteData, errors } = await deleteLogicFunction({
      input: { id: logicFunctionId },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(deleteData.deleteOneLogicFunction.id).toBe(logicFunctionId);
  });
});
