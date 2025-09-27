import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
  assertViewStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';
import { createViewOperationFactory } from 'test/integration/graphql/utils/create-view-operation-factory.util';

import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

describe('Create core view', () => {
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

  it('should create a new view with all properties', async () => {
    const input = {
      name: 'Kanban View',
      objectMetadataId: testObjectMetadataId,
      icon: 'IconDeal',
      type: ViewType.KANBAN,
      key: null,
      position: 1,
      isCompact: true,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    };

    const operation = createViewOperationFactory({ data: input });
    const response = await makeGraphqlAPIRequest(operation);

    assertGraphQLSuccessfulResponse(response);
    assertViewStructure(response.body.data.createCoreView, {
      name: input.name,
      objectMetadataId: input.objectMetadataId,
      type: input.type,
      key: null,
      icon: input.icon,
      position: input.position,
      isCompact: input.isCompact,
      openRecordIn: input.openRecordIn,
    });
  });

  it('should create a view with minimum required fields', async () => {
    const input = {
      name: 'Minimal View',
      objectMetadataId: testObjectMetadataId,
      icon: 'IconList',
    };

    const operation = createViewOperationFactory({ data: input });
    const response = await makeGraphqlAPIRequest(operation);

    assertGraphQLSuccessfulResponse(response);
    assertViewStructure(response.body.data.createCoreView, {
      name: input.name,
      objectMetadataId: input.objectMetadataId,
      icon: input.icon,
      type: ViewType.TABLE,
      key: null,
      position: 0,
      isCompact: false,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    });
  });
});
