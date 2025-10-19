import { TEST_NOT_EXISTING_VIEW_ID } from 'test/integration/constants/test-view-ids.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { updateOneCoreView } from 'test/integration/metadata/suites/view/utils/update-one-core-view.util';
import { cleanupViewRecords } from 'test/integration/utils/view-test.util';

import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

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

    const updateInput = {
      id: view.id,
      name: 'Updated View',
      type: ViewType.KANBAN,
      isCompact: true,
    };

    const { data, errors } = await updateOneCoreView({
      viewId: view.id,
      input: updateInput,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.updateCoreView).toMatchObject({
      id: view.id,
      name: 'Updated View',
      type: ViewType.KANBAN,
      isCompact: true,
    });
  });

  it('should throw error when updating non-existent view', async () => {
    const { errors } = await updateOneCoreView({
      viewId: TEST_NOT_EXISTING_VIEW_ID,
      input: { id: TEST_NOT_EXISTING_VIEW_ID, name: 'Non-existent View' },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
