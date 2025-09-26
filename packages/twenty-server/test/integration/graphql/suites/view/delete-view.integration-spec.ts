import { TEST_NOT_EXISTING_VIEW_ID } from 'test/integration/constants/test-view-ids.constants';
import { deleteViewOperationFactory } from 'test/integration/graphql/utils/delete-view-operation-factory.util';
import { findViewOperationFactory } from 'test/integration/graphql/utils/find-view-operation-factory.util';
import {
  assertGraphQLErrorResponseWithSnapshot,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { cleanupViewRecords } from 'test/integration/utils/view-test.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';

describe('Delete core view', () => {
  let testObjectMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myViewTestObject',
        namePlural: 'myViewTestObjects',
        labelSingular: 'My View Test Object',
        labelPlural: 'My View Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
    await cleanupViewRecords();
  });

  beforeEach(async () => {
    await cleanupViewRecords();
  });

  it('should delete an existing view', async () => {
    const {
      data: { createCoreView: view },
    } = await createOneCoreView({
      input: {
        name: 'View to Delete',
        objectMetadataId: testObjectMetadataId,
        icon: '123Icon',
      },
      expectToFail: false,
    });

    const deleteOperation = deleteViewOperationFactory({ viewId: view.id });
    const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

    assertGraphQLSuccessfulResponse(deleteResponse);
    expect(deleteResponse.body.data.deleteCoreView).toBe(true);

    const getOperation = findViewOperationFactory({ viewId: view.id });
    const getResponse = await makeGraphqlAPIRequest(getOperation);

    expect(getResponse.body.data.getCoreView).toBeNull();
  });

  it('should throw an error when deleting non-existent view', async () => {
    const operation = deleteViewOperationFactory({
      viewId: TEST_NOT_EXISTING_VIEW_ID,
    });
    const response = await makeGraphqlAPIRequest(operation);

    assertGraphQLErrorResponseWithSnapshot(response);
  });
});
