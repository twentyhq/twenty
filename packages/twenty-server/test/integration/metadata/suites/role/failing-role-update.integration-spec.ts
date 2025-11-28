import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateRolePayload } from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';

type TestContext = {
  input: (testSetup: TestSetup) => {
    idToUpdate: string;
    updatePayload: UpdateRolePayload;
  };
};

type TestSetup = {
  testRoleId: string;
  existingRoleLabelForDuplicate: string;
  nonEditableRoleId: string;
};

type GlobalTestContext = {
  existingRoleLabelForDuplicate: string;
  nonEditableRoleId: string;
};

const globalTestContext: GlobalTestContext = {
  existingRoleLabelForDuplicate: 'Existing Role For Duplicate Test',
  nonEditableRoleId: '',
};

type UpdateOneRoleTestingContext = EachTestingContext<TestContext>[];

describe('Role update should fail', () => {
  let testRoleId: string;
  let existingRoleIdForDuplicate: string;

  beforeAll(async () => {
    // Get a non-editable system role (Admin) for testing
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });

    globalTestContext.nonEditableRoleId = adminRole.id;

    // Create a role that will be used to test duplicate label validation
    const { data: duplicateData } = await createOneRole({
      expectToFail: false,
      input: {
        label: globalTestContext.existingRoleLabelForDuplicate,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    existingRoleIdForDuplicate = duplicateData.createOneRole.id;
  });

  beforeEach(async () => {
    // Create a role for each test
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role To Update',
        description: 'Original description',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    testRoleId = data.createOneRole.id;
  });

  afterEach(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: testRoleId },
    });
  });

  afterAll(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: existingRoleIdForDuplicate },
    });
  });

  describe('updating role with existing write permissions', () => {
    let roleWithWritePermissionsId: string;

    beforeEach(async () => {
      // Create a role with read=true and write=true
      const { data } = await createOneRole({
        expectToFail: false,
        input: {
          label: 'Role With Write Permissions',
          description: 'Role with write permissions for update tests',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        },
      });

      roleWithWritePermissionsId = data.createOneRole.id;
    });

    afterEach(async () => {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleWithWritePermissionsId },
      });
    });

    it('should fail when updating only canReadAllObjectRecords to false while role has existing write permissions', async () => {
      const { errors } = await updateOneRole({
        expectToFail: true,
        input: {
          idToUpdate: roleWithWritePermissionsId,
          updatePayload: {
            canReadAllObjectRecords: false,
          },
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });
  });

  const failingRoleUpdateTestCases: UpdateOneRoleTestingContext = [
    {
      title: 'when updating label to one that already exists',
      context: {
        input: (testSetup) => ({
          idToUpdate: testSetup.testRoleId,
          updatePayload: {
            label: testSetup.existingRoleLabelForDuplicate,
          },
        }),
      },
    },
    {
      title: 'when updating a non-editable system role',
      context: {
        input: (testSetup) => ({
          idToUpdate: testSetup.nonEditableRoleId,
          updatePayload: {
            label: 'new role label',
          },
        }),
      },
    },
    // Read/Write permissions consistency tests
    {
      title:
        'when updating canReadAllObjectRecords to false while canUpdateAllObjectRecords is true',
      context: {
        input: (testSetup) => ({
          idToUpdate: testSetup.testRoleId,
          updatePayload: {
            canReadAllObjectRecords: false,
            canUpdateAllObjectRecords: true,
          },
        }),
      },
    },
    {
      title:
        'when updating canReadAllObjectRecords to false while canSoftDeleteAllObjectRecords is true',
      context: {
        input: (testSetup) => ({
          idToUpdate: testSetup.testRoleId,
          updatePayload: {
            canReadAllObjectRecords: false,
            canSoftDeleteAllObjectRecords: true,
          },
        }),
      },
    },
    {
      title:
        'when updating canReadAllObjectRecords to false while canDestroyAllObjectRecords is true',
      context: {
        input: (testSetup) => ({
          idToUpdate: testSetup.testRoleId,
          updatePayload: {
            canReadAllObjectRecords: false,
            canDestroyAllObjectRecords: true,
          },
        }),
      },
    },
    {
      title:
        'when updating to enable write permissions without read permission',
      context: {
        input: (testSetup) => ({
          idToUpdate: testSetup.testRoleId,
          updatePayload: {
            canReadAllObjectRecords: false,
            canUpdateAllObjectRecords: true,
            canSoftDeleteAllObjectRecords: true,
          },
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingRoleUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        testRoleId,
        existingRoleLabelForDuplicate:
          globalTestContext.existingRoleLabelForDuplicate,
        nonEditableRoleId: globalTestContext.nonEditableRoleId,
      };

      const { idToUpdate, updatePayload } = context.input(testSetup);

      const { errors } = await updateOneRole({
        expectToFail: true,
        input: {
          idToUpdate,
          updatePayload,
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );

  it('should fail when updating a non-existent role', async () => {
    const nonExistentRoleId = faker.string.uuid();

    const { errors } = await updateOneRole({
      expectToFail: true,
      input: {
        idToUpdate: nonExistentRoleId,
        updatePayload: {
          label: 'Updated Label',
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
