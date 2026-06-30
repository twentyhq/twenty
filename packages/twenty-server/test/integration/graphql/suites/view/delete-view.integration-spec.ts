import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { deleteOneView } from 'test/integration/metadata/suites/view/utils/delete-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';

const TEST_NOT_EXISTING_VIEW_ID = '20202020-0000-4000-8000-000000000000';

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
  });

  it('should delete an existing view', async () => {
    const {
      data: { createView: view },
    } = await createOneView({
      input: {
        name: 'View to Delete',
        objectMetadataId: testObjectMetadataId,
        icon: '123Icon',
      },
      expectToFail: false,
    });

    const { data: deleteData, errors: deleteErrors } = await deleteOneView({
      viewId: view.id,
      expectToFail: false,
    });

    expect(deleteErrors).toBeUndefined();
    expect(deleteData.deleteView).toBe(true);

    const { data: getData } = await findOneView({
      viewId: view.id,
      expectToFail: false,
    });

    expect(getData.getView).toBeNull();
  });

  it('should throw an error when deleting non-existent view', async () => {
    const { errors } = await deleteOneView({
      viewId: TEST_NOT_EXISTING_VIEW_ID,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
