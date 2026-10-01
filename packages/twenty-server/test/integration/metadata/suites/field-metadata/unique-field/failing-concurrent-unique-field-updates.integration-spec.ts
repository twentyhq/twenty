import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

// More concurrent failing migrations than the default core pool size (10)
const CONCURRENT_FAILING_MIGRATION_COUNT = 12;

describe('failing concurrent unique field updates', () => {
  let createdObjectMetadataId = '';
  let createdFieldMetadataId = '';

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testObjectForConcurrentUniqueUpdate',
        namePlural: 'testObjectsForConcurrentUniqueUpdate',
        labelSingular: 'Test Object For Concurrent Unique Update',
        labelPlural: 'Test Objects For Concurrent Unique Update',
        icon: 'IconTest',
      },
    });

    createdObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'duplicatedValue',
        label: 'Duplicated Value',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
      },
    });

    createdFieldMetadataId = fieldMetadataId;

    await createManyOperation({
      objectMetadataSingularName: 'testObjectForConcurrentUniqueUpdate',
      objectMetadataPluralName: 'testObjectsForConcurrentUniqueUpdate',
      data: [{ duplicatedValue: 'same' }, { duplicatedValue: 'same' }],
    });
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it('should fail every migration and keep serving requests', async () => {
    const results = await Promise.all(
      Array.from({ length: CONCURRENT_FAILING_MIGRATION_COUNT }, () =>
        updateOneFieldMetadata({
          expectToFail: true,
          input: {
            idToUpdate: createdFieldMetadataId,
            updatePayload: { isUnique: true },
          },
        }),
      ),
    );

    for (const { errors } of results) {
      expect(errors).toBeDefined();
    }

    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'testObjectForConcurrentUniqueUpdate',
        objectMetadataPluralName: 'testObjectsForConcurrentUniqueUpdate',
        gqlFields: 'id',
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.testObjectsForConcurrentUniqueUpdate.edges,
    ).toHaveLength(2);
  });
});
