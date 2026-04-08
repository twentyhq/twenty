import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { type ObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/object-metadata-command-menu-item-payload.type';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

const findNavigationCommandMenuItemForObject = (
  commandMenuItems: CommandMenuItemDTO[],
  objectMetadataId: string,
) =>
  commandMenuItems.find(
    (item) =>
      item.engineComponentKey === EngineComponentKey.NAVIGATION &&
      (item.payload as ObjectMetadataCommandMenuItemPayload | undefined)
        ?.objectMetadataItemId === objectMetadataId,
  );

const COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  engineComponentKey
  label
  icon
  payload {
    ... on PathCommandMenuItemPayload {
      path
    }
    ... on ObjectMetadataCommandMenuItemPayload {
      objectMetadataItemId
    }
  }
`;

describe('Command menu item side effect on object metadata', () => {
  let createdObjectMetadataId: string | undefined = undefined;

  const uniqueSuffix = Date.now().toString().slice(-8);

  const createObjectInput: CreateOneObjectFactoryInput = {
    namePlural: `sideEffectItems${uniqueSuffix}`,
    nameSingular: `sideEffectItem${uniqueSuffix}`,
    labelPlural: `Side Effect Items ${uniqueSuffix}`,
    labelSingular: `Side Effect Item ${uniqueSuffix}`,
    description: 'Object for command menu item side effect tests',
    icon: 'IconBox',
    isLabelSyncedWithName: false,
  };

  afterEach(async () => {
    if (!isDefined(createdObjectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
      expectToFail: false,
    });

    createdObjectMetadataId = undefined;
  });

  it('should create a navigation command menu item when a custom object is created', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;

    const {
      data: { commandMenuItems },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    const navigationItem = findNavigationCommandMenuItemForObject(
      commandMenuItems,
      createdObjectMetadataId,
    );

    expect(navigationItem).toEqual(
      expect.objectContaining({
        label: `Go to ${createObjectInput.labelPlural}`,
        icon: createObjectInput.icon,
        engineComponentKey: EngineComponentKey.NAVIGATION,
      }),
    );
  });

  it('should delete the navigation command menu item when a custom object is deleted', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;
    const deletedObjectId = createdObjectMetadataId;

    const {
      data: { commandMenuItems: itemsBeforeDelete },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationCommandMenuItemForObject(
        itemsBeforeDelete,
        deletedObjectId,
      ),
    ).toBeDefined();

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
      expectToFail: false,
    });

    createdObjectMetadataId = undefined;

    const {
      data: { commandMenuItems: itemsAfterDelete },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationCommandMenuItemForObject(
        itemsAfterDelete,
        deletedObjectId,
      ),
    ).toBeUndefined();
  });

  it('should delete the navigation command menu item when a custom object is disabled', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;

    const {
      data: { commandMenuItems: itemsBeforeDisable },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationCommandMenuItemForObject(
        itemsBeforeDisable,
        createdObjectMetadataId,
      ),
    ).toBeDefined();

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    const {
      data: { commandMenuItems: itemsAfterDisable },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationCommandMenuItemForObject(
        itemsAfterDisable,
        createdObjectMetadataId,
      ),
    ).toBeUndefined();
  });

  it('should recreate the navigation command menu item when a disabled object is re-enabled', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: 'id',
    });

    createdObjectMetadataId = createOneObject.id;

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    const {
      data: { commandMenuItems: itemsWhileDisabled },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    expect(
      findNavigationCommandMenuItemForObject(
        itemsWhileDisabled,
        createdObjectMetadataId,
      ),
    ).toBeUndefined();

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: true },
      },
    });

    const {
      data: { commandMenuItems: itemsAfterReEnable },
    } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
    });

    const navigationItem = findNavigationCommandMenuItemForObject(
      itemsAfterReEnable,
      createdObjectMetadataId,
    );

    expect(navigationItem).toEqual(
      expect.objectContaining({
        label: `Go to ${createObjectInput.labelPlural}`,
        icon: createObjectInput.icon,
        engineComponentKey: EngineComponentKey.NAVIGATION,
      }),
    );
  });
});
