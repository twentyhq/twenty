import { faker } from '@faker-js/faker';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { updateCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/update-command-menu-item.util';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';

describe('CommandMenuItem update should succeed', () => {
  let createdCommandMenuItemId: string;

  beforeEach(async () => {
    const workflowVersionId = faker.string.uuid();

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Original Label',
        icon: 'IconOriginal',
        isPinned: false,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      },
    });

    createdCommandMenuItemId = data.createCommandMenuItem.id;
  });

  afterEach(async () => {
    if (createdCommandMenuItemId) {
      await deleteCommandMenuItem({
        expectToFail: false,
        input: { id: createdCommandMenuItemId },
      });
      createdCommandMenuItemId = undefined as unknown as string;
    }
  });

  it('should update the label', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        label: 'Updated Label',
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      label: 'Updated Label',
    });
  });

  it('should update the icon', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        icon: 'IconUpdated',
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      icon: 'IconUpdated',
    });
  });

  it('should update isPinned', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        isPinned: true,
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      isPinned: true,
    });
  });

  it('should update availabilityType and availabilityObjectNameSingular', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        availabilityType: CommandMenuItemAvailabilityType.SINGLE_RECORD,
        availabilityObjectNameSingular: 'company',
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      availabilityType: CommandMenuItemAvailabilityType.SINGLE_RECORD,
      availabilityObjectNameSingular: 'company',
    });
  });

  it('should update multiple fields at once', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        label: 'Fully Updated Label',
        icon: 'IconNew',
        isPinned: true,
        availabilityType: CommandMenuItemAvailabilityType.BULK_RECORDS,
        availabilityObjectNameSingular: 'person',
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      label: 'Fully Updated Label',
      icon: 'IconNew',
      isPinned: true,
      availabilityType: CommandMenuItemAvailabilityType.BULK_RECORDS,
      availabilityObjectNameSingular: 'person',
    });
  });
});
