import { TEST_NOT_EXISTING_VIEW_ID } from 'test/integration/constants/test-view-ids.constants';
import {
  assertGraphQLErrorResponseWithSnapshot,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { cleanupViewRecords } from 'test/integration/utils/view-test.util';
import { updateViewOperationFactory } from 'test/integration/graphql/utils/update-view-operation-factory.util';
import { updateViewData } from 'test/integration/graphql/utils/view-data-factory.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';

import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

describe('Update core view', () => {
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

  it('should update an existing view', async () => {
    const {
      data: { createCoreView: view },
    } = await createOneCoreView({
      input: {
        icon: '123Icon',
        name: 'Original View',
        type: ViewType.TABLE,
        isCompact: false,
        objectMetadataId: testObjectMetadataId,
      },
      expectToFail: false,
    });

    const updateInput = updateViewData({
      name: 'Updated View',
      type: ViewType.KANBAN,
      isCompact: true,
    });

    const operation = updateViewOperationFactory({
      viewId: view.id,
      data: updateInput,
    });
    const response = await makeGraphqlAPIRequest(operation);

    assertGraphQLSuccessfulResponse(response);
    expect(response.body.data.updateCoreView).toMatchObject({
      id: view.id,
      ...updateInput,
    });
  });

  it('should throw error when updating non-existent view', async () => {
    const operation = updateViewOperationFactory({
      viewId: TEST_NOT_EXISTING_VIEW_ID,
      data: { name: 'Non-existent View' },
    });
    const response = await makeGraphqlAPIRequest(operation);

    assertGraphQLErrorResponseWithSnapshot(response);
  });
});
