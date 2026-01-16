import { faker } from '@faker-js/faker';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';

describe('CommandMenuItem deletion should succeed', () => {
  it('should delete an existing command menu item', async () => {
    const workflowVersionId = faker.string.uuid();

    const { data: createData } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Command Menu Item To Delete',
      },
    });

    const createdId = createData.createCommandMenuItem.id;

    const { data: deleteData } = await deleteCommandMenuItem({
      expectToFail: false,
      input: { id: createdId },
    });

    expect(deleteData.deleteCommandMenuItem).toMatchObject({
      id: createdId,
      label: 'Command Menu Item To Delete',
    });

    const { data: findData } = await findCommandMenuItems({
      expectToFail: false,
      input: undefined,
    });

    const deletedItem = findData.commandMenuItems.find(
      (item) => item.id === createdId,
    );

    expect(deletedItem).toBeUndefined();
  });
});
