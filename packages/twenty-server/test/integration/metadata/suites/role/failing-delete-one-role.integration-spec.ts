import { faker } from '@faker-js/faker';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { NavigationMenuItemType, ViewFilterOperand } from 'twenty-shared/types';

type TestContext = {
  input: (testSetup: TestSetup) => {
    idToDelete: string;
  };
};

type TestSetup = {
  adminRoleId: string;
  memberRoleId: string;
  conditionalDisplayRoleId: string;
};

type GlobalTestContext = {
  adminRoleId: string;
  memberRoleId: string;
  conditionalDisplayRoleId: string;
  conditionalDisplayNavigationMenuItemId: string;
};

const globalTestContext: GlobalTestContext = {
  adminRoleId: '',
  memberRoleId: '',
  conditionalDisplayRoleId: '',
  conditionalDisplayNavigationMenuItemId: '',
};

type DeleteOneRoleTestingContext = EachTestingContext<TestContext>[];

describe('Role deletion should fail', () => {
  beforeAll(async () => {
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });
    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    globalTestContext.adminRoleId = adminRole.id;
    globalTestContext.memberRoleId = memberRole.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Role Referenced By Conditional Display',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    globalTestContext.conditionalDisplayRoleId = roleData.createOneRole.id;

    const { data: navigationMenuItemData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.FOLDER,
        name: 'Folder Visible To One Role',
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              contextKey: 'currentRoleId',
              operand: ViewFilterOperand.IS,
              value: JSON.stringify([
                globalTestContext.conditionalDisplayRoleId,
              ]),
            },
          ],
        },
      },
    });

    globalTestContext.conditionalDisplayNavigationMenuItemId =
      navigationMenuItemData.createNavigationMenuItem.id;
  });

  afterAll(async () => {
    await deleteNavigationMenuItem({
      expectToFail: false,
      input: { id: globalTestContext.conditionalDisplayNavigationMenuItemId },
    });

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: globalTestContext.conditionalDisplayRoleId },
    });
  });

  const failingRoleDeletionTestCases: DeleteOneRoleTestingContext = [
    {
      title: 'when deleting a non-editable system role (Admin)',
      context: {
        input: (testSetup) => ({
          idToDelete: testSetup.adminRoleId,
        }),
      },
    },
    {
      title: 'when deleting the workspace default role (Member)',
      context: {
        input: (testSetup) => ({
          idToDelete: testSetup.memberRoleId,
        }),
      },
    },
    {
      title: 'when deleting a non-existent role',
      context: {
        input: () => ({
          idToDelete: faker.string.uuid(),
        }),
      },
    },
    {
      title: 'when deleting a role referenced by a conditional display',
      context: {
        input: (testSetup) => ({
          idToDelete: testSetup.conditionalDisplayRoleId,
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingRoleDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        adminRoleId: globalTestContext.adminRoleId,
        memberRoleId: globalTestContext.memberRoleId,
        conditionalDisplayRoleId: globalTestContext.conditionalDisplayRoleId,
      };

      const { idToDelete } = context.input(testSetup);

      const { errors } = await deleteOneRole({
        expectToFail: true,
        input: {
          idToDelete,
        },
      });

      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    },
  );
});
