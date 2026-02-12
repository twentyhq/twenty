import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createManyCoreViewFieldGroups } from 'test/integration/metadata/suites/view-field-group/utils/create-many-core-view-field-groups.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { v4 as uuidv4 } from 'uuid';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';

describe('View Field Group Resolver - Failing Create Many Operations', () => {
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
        nameSingular: 'myFieldGroupTestObject',
        namePlural: 'myFieldGroupTestObjects',
        labelSingular: 'My Field Group Test Object',
        labelPlural: 'My Field Group Test Objects',
        icon: 'Icon123',
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
        name: 'TestViewForFieldGroups',
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

  it('should fail when some inputs reference non-existent views', async () => {
    const invalidViewId = uuidv4();

    const inputs: CreateViewFieldGroupInput[] = [
      {
        name: 'Valid Group',
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
      },
      {
        name: 'Invalid Group',
        viewId: invalidViewId,
        position: 1,
        isVisible: true,
      },
    ];

    const { errors } = await createManyCoreViewFieldGroups({
      inputs,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
