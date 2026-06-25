import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createManyViewGroups } from 'test/integration/metadata/suites/view-group/utils/create-many-view-groups.util';
import { deleteOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/delete-one-view-group.util';
import { destroyOneViewGroup } from 'test/integration/metadata/suites/view-group/utils/destroy-one-view-group.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

describe('View Group Resolver - Successful Create Many Operations - v2', () => {
  let testSetup: {
    testViewId: string;
    testObjectMetadataId: string;
    firstTestFieldMetadataId: string;
    secondTestFieldMetadataId: string;
    thirdTestFieldMetadataId: string;
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
        nameSingular: 'myGroupTestObjectV2',
        namePlural: 'myGroupTestObjectsV2',
        labelSingular: 'My Group Test Object v2',
        labelPlural: 'My Group Test Objects v2',
        icon: 'Icon123',
      },
    });

    const {
      data: {
        createOneField: { id: firstTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: true,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    const {
      data: {
        createOneField: { id: secondTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'secondTestField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    const {
      data: {
        createOneField: { id: thirdTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'thirdTestField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
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
        name: 'TestViewForGroups',
        mainGroupByFieldMetadataId: selectFieldMetadataId,
      },
      expectToFail: false,
    });

    testSetup = {
      testViewId,
      testObjectMetadataId: objectMetadataId,
      firstTestFieldMetadataId,
      secondTestFieldMetadataId,
      thirdTestFieldMetadataId,
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
        await destroyOneViewGroup({
          expectToFail: false,
          input: {
            id: viewGroupId,
          },
        });
      }
    }
    createdViewGroupIds = [];
  });

  it('should successfully create multiple view groups in batch', async () => {
    const inputs: CreateViewGroupInput[] = [
      {
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        fieldValue: 'Group A',
      },
      {
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: false,
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
      data: { createManyViewGroups: createdViewGroups },
      errors,
    } = await createManyViewGroups({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewGroups).toBeDefined();
    expect(createdViewGroups).toHaveLength(3);

    createdViewGroups.forEach((viewGroup, index) => {
      expect(viewGroup).toMatchObject({
        viewId: testSetup.testViewId,
        position: inputs[index].position,
        isVisible: inputs[index].isVisible,
        fieldValue: inputs[index].fieldValue,
      });

      createdViewGroupIds.push(viewGroup.id);
    });
  });

  it('should successfully create single view group using batch endpoint', async () => {
    const inputs: CreateViewGroupInput[] = [
      {
        viewId: testSetup.testViewId,
        position: 5,
        isVisible: true,
        fieldValue: 'Single Group',
      },
    ];

    const {
      data: { createManyViewGroups: createdViewGroups },
      errors,
    } = await createManyViewGroups({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewGroups).toBeDefined();
    expect(createdViewGroups).toHaveLength(1);

    const viewGroup = createdViewGroups[0];

    expect(viewGroup).toMatchObject({
      viewId: testSetup.testViewId,
      position: 5,
      isVisible: true,
      fieldValue: 'Single Group',
    });

    createdViewGroupIds.push(viewGroup.id);
  });

  it('should return empty array when creating zero view groups', async () => {
    const inputs: CreateViewGroupInput[] = [];

    const {
      data: { createManyViewGroups: createdViewGroups },
      errors,
    } = await createManyViewGroups({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewGroups).toBeDefined();
    expect(createdViewGroups).toHaveLength(0);
  });
});
