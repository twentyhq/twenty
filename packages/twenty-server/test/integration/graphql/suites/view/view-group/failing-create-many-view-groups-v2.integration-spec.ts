import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createManyCoreViewGroups } from 'test/integration/metadata/suites/view-group/utils/create-many-core-view-groups.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';

import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

describe('View Group Resolver - Failing Create Many Operations - v2', () => {
  let testSetup: {
    testViewId: string;
    testObjectMetadataId: string;
  };

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myGroupTestObjectV2',
        namePlural: 'myGroupTestObjectsV2',
        labelSingular: 'My Group Test Object v2',
        labelPlural: 'My Group Test Objects v2',
        icon: 'Icon123',
      },
    });

    const { selectFieldMetadataId } =
      await createOneSelectFieldMetadataForIntegrationTests({
        input: {
          objectMetadataId,
        },
      });

    const {
      data: {
        createCoreView: { id: testViewId },
      },
    } = await createOneCoreView({
      input: {
        icon: 'icon123',
        objectMetadataId,
        name: 'TestViewForGroups',
        mainGroupByFieldMetadataId: selectFieldMetadataId,
      },
      expectToFail: false,
    });

    testSetup = {
      testViewId,
      testObjectMetadataId: objectMetadataId,
    };
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: testSetup.testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.testObjectMetadataId },
    });
  });

  it('should accumulate multiple validation errors when some inputs are invalid', async () => {
    const inputs: CreateViewGroupInput[] = [
      {
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
      },
    ] as CreateViewGroupInput[];

    const { errors } = await createManyCoreViewGroups({
      inputs,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
