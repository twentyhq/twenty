import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { deleteOneCoreView } from 'test/integration/metadata/suites/view/utils/delete-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { findOneCoreView } from 'test/integration/metadata/suites/view/utils/find-one-core-view.util';

const TEST_NOT_EXISTING_VIEW_ID = '20202020-0000-4000-8000-000000000000';

describe('Destroy core view', () => {
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

  it('should destroy an existing view', async () => {
    const {
      data: { createCoreView: view },
    } = await createOneCoreView({
      input: {
        icon: '123Icon',
        name: 'View to Destroy',
        objectMetadataId: testObjectMetadataId,
      },
      expectToFail: false,
    });

    const { data: deleteData, errors: deleteErrors } = await deleteOneCoreView({
      viewId: view.id,
      expectToFail: false,
    });

    expect(deleteErrors).toBeUndefined();
    expect(deleteData.deleteCoreView).toBe(true);

    const { data: destroyData, errors: destroyErrors } =
      await destroyOneCoreView({
        viewId: view.id,
        expectToFail: false,
      });

    expect(destroyErrors).toBeUndefined();
    expect(destroyData.destroyCoreView).toBe(true);

    const { data: getData } = await findOneCoreView({
      viewId: view.id,
      expectToFail: false,
    });

    expect(getData.getCoreView).toBeNull();
  });

  it('should throw an error when destroying non-existent view', async () => {
    const { errors } = await destroyOneCoreView({
      viewId: TEST_NOT_EXISTING_VIEW_ID,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
