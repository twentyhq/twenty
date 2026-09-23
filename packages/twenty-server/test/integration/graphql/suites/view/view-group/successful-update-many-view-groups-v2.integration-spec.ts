import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createManyViewGroups } from 'test/integration/metadata/suites/view-group/utils/create-many-view-groups.util';
import { deleteOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/delete-one-view-group.util';
import { updateManyViewGroups } from 'test/integration/metadata/suites/view-group/utils/update-many-view-groups.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('View Group Resolver - Successful Update Many Operations - v2', () => {
  let testSetup: {
    testViewId: string;
    testObjectMetadataId: string;
  };
  let createdViewGroupIds: string[] = [];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myUpdateManyGroupTestObjectV2',
        namePlural: 'myUpdateManyGroupTestObjectsV2',
        labelSingular: 'My Update Many Group Test Object v2',
        labelPlural: 'My Update Many Group Test Objects v2',
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
        createView: { id: testViewId },
      },
    } = await createOneView({
      input: {
        icon: 'icon123',
        objectMetadataId,
        name: 'TestViewForUpdateManyGroups',
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

  afterEach(async () => {
    for (const viewGroupId of createdViewGroupIds) {
      if (isDefined(viewGroupId)) {
        const {
          data: { deleteViewGroup },
        } = await deleteOneViewGroup({
          expectToFail: false,
          input: {
            id: viewGroupId,
          },
        });

        expect(deleteViewGroup.deletedAt).not.toBeNull();
      }
    }
    createdViewGroupIds = [];
  });

  it('should batch-update positions of multiple view groups at once', async () => {
    const createInputs: CreateViewGroupInput[] = [
      {
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        fieldValue: 'Group A',
      },
      {
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: true,
        fieldValue: 'Group B',
      },
      {
        viewId: testSetup.testViewId,
        position: 2,
        isVisible: true,
        fieldValue: 'Group C',
      },
    ];

    const {
      data: { createManyViewGroups: createdGroups },
    } = await createManyViewGroups({
      inputs: createInputs,
      expectToFail: false,
    });

    createdViewGroupIds = createdGroups.map(
      (viewGroup: { id: string }) => viewGroup.id,
    );

    const firstGroupId = createdGroups[0]?.id;
    const secondGroupId = createdGroups[1]?.id;
    const thirdGroupId = createdGroups[2]?.id;

    jestExpectToBeDefined(firstGroupId);
    jestExpectToBeDefined(secondGroupId);
    jestExpectToBeDefined(thirdGroupId);

    const {
      data: { updateManyViewGroups: updatedGroups },
      errors,
    } = await updateManyViewGroups({
      inputs: [
        { id: firstGroupId, update: { position: 2 } },
        { id: secondGroupId, update: { position: 0 } },
        { id: thirdGroupId, update: { position: 1 } },
      ],
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(updatedGroups).toBeDefined();
    expect(updatedGroups).toHaveLength(3);

    expect(updatedGroups[0]).toMatchObject({
      id: firstGroupId,
      position: 2,
    });
    expect(updatedGroups[1]).toMatchObject({
      id: secondGroupId,
      position: 0,
    });
    expect(updatedGroups[2]).toMatchObject({
      id: thirdGroupId,
      position: 1,
    });
  });

  it('should batch-update visibility of multiple view groups at once', async () => {
    const createInputs: CreateViewGroupInput[] = [
      {
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        fieldValue: 'Visible Group',
      },
      {
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: true,
        fieldValue: 'To Be Hidden Group',
      },
    ];

    const {
      data: { createManyViewGroups: createdGroups },
    } = await createManyViewGroups({
      inputs: createInputs,
      expectToFail: false,
    });

    createdViewGroupIds = createdGroups.map(
      (viewGroup: { id: string }) => viewGroup.id,
    );

    const firstGroupId = createdGroups[0]?.id;
    const secondGroupId = createdGroups[1]?.id;

    jestExpectToBeDefined(firstGroupId);
    jestExpectToBeDefined(secondGroupId);

    const {
      data: { updateManyViewGroups: updatedGroups },
      errors,
    } = await updateManyViewGroups({
      inputs: [
        { id: firstGroupId, update: { isVisible: false } },
        {
          id: secondGroupId,
          update: { isVisible: false, position: 5 },
        },
      ],
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(updatedGroups).toBeDefined();
    expect(updatedGroups).toHaveLength(2);

    expect(updatedGroups[0]).toMatchObject({
      id: firstGroupId,
      isVisible: false,
    });
    expect(updatedGroups[1]).toMatchObject({
      id: secondGroupId,
      isVisible: false,
      position: 5,
    });
  });

  it('should return empty array for empty inputs', async () => {
    const {
      data: { updateManyViewGroups: updatedGroups },
      errors,
    } = await updateManyViewGroups({
      inputs: [],
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(updatedGroups).toBeDefined();
    expect(updatedGroups).toHaveLength(0);
  });
});
