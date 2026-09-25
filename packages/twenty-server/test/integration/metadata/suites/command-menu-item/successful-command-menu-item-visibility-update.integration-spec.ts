import { faker } from '@faker-js/faker';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import { updateCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/update-command-menu-item.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

const GQL_FIELDS = `
  id
  engineComponentKey
  isActive
`;

const findCommandMenuItemById = async (id: string) => {
  const { data } = await findCommandMenuItems({
    expectToFail: false,
    input: undefined,
    gqlFields: GQL_FIELDS,
  });

  return data.commandMenuItems.find((item) => item.id === id);
};

const expectHideAndShowToSucceed = async (id: string) => {
  const { data: hideData } = await updateCommandMenuItem({
    expectToFail: false,
    input: { id, isActive: false },
    gqlFields: GQL_FIELDS,
  });

  expect(hideData.updateCommandMenuItem).toMatchObject({
    id,
    isActive: false,
  });
  expect(await findCommandMenuItemById(id)).toMatchObject({
    id,
    isActive: false,
  });

  const { data: showData } = await updateCommandMenuItem({
    expectToFail: false,
    input: { id, isActive: true },
    gqlFields: GQL_FIELDS,
  });

  expect(showData.updateCommandMenuItem).toMatchObject({
    id,
    isActive: true,
  });
};

describe('CommandMenuItem visibility update should succeed', () => {
  describe('on a standard command menu item', () => {
    let standardCommandMenuItemId: string;

    beforeAll(async () => {
      const { data } = await findCommandMenuItems({
        expectToFail: false,
        input: undefined,
        gqlFields: GQL_FIELDS,
      });

      const standardCommandMenuItem = data.commandMenuItems.find(
        (item) => item.engineComponentKey === EngineComponentKey.EXPORT_VIEW,
      );

      jestExpectToBeDefined(standardCommandMenuItem);

      standardCommandMenuItemId = standardCommandMenuItem.id;
    });

    afterAll(async () => {
      await updateCommandMenuItem({
        expectToFail: false,
        input: { id: standardCommandMenuItemId, isActive: true },
        gqlFields: GQL_FIELDS,
      });
    });

    it('should hide and show it', async () => {
      await expectHideAndShowToSucceed(standardCommandMenuItemId);
    });
  });

  describe('on a custom command menu item', () => {
    let customCommandMenuItemId: string;

    beforeAll(async () => {
      const { data } = await createCommandMenuItem({
        expectToFail: false,
        input: {
          workflowVersionId: faker.string.uuid(),
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: 'Custom Command Menu Item To Hide',
        },
      });

      customCommandMenuItemId = data.createCommandMenuItem.id;
    });

    afterAll(async () => {
      await deleteCommandMenuItem({
        expectToFail: false,
        input: { id: customCommandMenuItemId },
      });
    });

    it('should hide and show it', async () => {
      await expectHideAndShowToSucceed(customCommandMenuItemId);
    });
  });
});
