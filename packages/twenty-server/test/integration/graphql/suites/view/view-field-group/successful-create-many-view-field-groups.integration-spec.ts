import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createManyCoreViewFieldGroups } from 'test/integration/metadata/suites/view-field-group/utils/create-many-core-view-field-groups.util';
import { deleteOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/delete-one-core-view-field-group.util';
import { destroyOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/destroy-one-core-view-field-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';

describe('View Field Group Resolver - Successful Create Many Operations', () => {
  let testSetup: {
    testViewId: string;
    testObjectMetadataId: string;
  };
  let createdViewFieldGroupIds: string[] = [];

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

  afterEach(async () => {
    for (const viewFieldGroupId of createdViewFieldGroupIds) {
      if (isDefined(viewFieldGroupId)) {
        const {
          data: { deleteCoreViewFieldGroup },
        } = await deleteOneCoreViewFieldGroup({
          expectToFail: false,
          input: {
            id: viewFieldGroupId,
          },
        });

        expect(deleteCoreViewFieldGroup.deletedAt).not.toBeNull();
        await destroyOneCoreViewFieldGroup({
          expectToFail: false,
          input: {
            id: viewFieldGroupId,
          },
        });
      }
    }
    createdViewFieldGroupIds = [];
  });

  it('should successfully create multiple view field groups in batch', async () => {
    const inputs: CreateViewFieldGroupInput[] = [
      {
        name: 'First Group',
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
      },
      {
        name: 'Second Group',
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: false,
      },
      {
        name: 'Third Group',
        viewId: testSetup.testViewId,
        position: 2,
        isVisible: true,
      },
    ];

    const {
      data: { createManyCoreViewFieldGroups: createdViewFieldGroups },
      errors,
    } = await createManyCoreViewFieldGroups({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFieldGroups).toBeDefined();
    expect(createdViewFieldGroups).toHaveLength(3);

    createdViewFieldGroups.forEach((viewFieldGroup, index) => {
      expect(viewFieldGroup).toMatchObject({
        name: inputs[index].name,
        viewId: testSetup.testViewId,
        position: inputs[index].position,
        isVisible: inputs[index].isVisible,
      });

      createdViewFieldGroupIds.push(viewFieldGroup.id);
    });
  });

  it('should successfully create single view field group using batch endpoint', async () => {
    const inputs: CreateViewFieldGroupInput[] = [
      {
        name: 'Single Batch Group',
        viewId: testSetup.testViewId,
        position: 5,
        isVisible: true,
      },
    ];

    const {
      data: { createManyCoreViewFieldGroups: createdViewFieldGroups },
      errors,
    } = await createManyCoreViewFieldGroups({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFieldGroups).toBeDefined();
    expect(createdViewFieldGroups).toHaveLength(1);

    const viewFieldGroup = createdViewFieldGroups[0];

    expect(viewFieldGroup).toMatchObject({
      name: 'Single Batch Group',
      viewId: testSetup.testViewId,
      position: 5,
      isVisible: true,
    });

    createdViewFieldGroupIds.push(viewFieldGroup.id);
  });

  it('should return empty array when creating zero view field groups', async () => {
    const inputs: CreateViewFieldGroupInput[] = [];

    const {
      data: { createManyCoreViewFieldGroups: createdViewFieldGroups },
      errors,
    } = await createManyCoreViewFieldGroups({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFieldGroups).toBeDefined();
    expect(createdViewFieldGroups).toHaveLength(0);
  });
});
