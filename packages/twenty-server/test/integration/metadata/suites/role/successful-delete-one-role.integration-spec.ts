import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

describe('Role deletion should succeed', () => {
  it('should delete a custom role immediately after removing its accepted member', async () => {
    const workspaceResponse = await makeMetadataApiRequest({
      query: gql`
        query CurrentWorkspaceInviteSetting {
          currentWorkspace {
            isPublicInviteLinkEnabled
          }
        }
      `,
      variables: {},
    });

    expect(workspaceResponse.body.errors).toBeUndefined();
    const initialPublicInviteLinkEnabled: boolean =
      workspaceResponse.body.data.currentWorkspace.isPublicInviteLinkEnabled;
    let workspaceMemberId: string | undefined;
    let roleId: string | undefined;

    try {
      const userEmail = `role-deletion-${randomUUID()}@example.com`;

      await signUpInWorkspaceAndGetAccessToken(userEmail);

      const memberResponse = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'workspaceMember',
          objectMetadataPluralName: 'workspaceMembers',
          gqlFields: 'id',
          filter: { userEmail: { eq: userEmail } },
        }),
      );

      expect(memberResponse.body.errors).toBeUndefined();
      workspaceMemberId =
        memberResponse.body.data.workspaceMembers.edges[0]?.node.id;
      jestExpectToBeDefined(workspaceMemberId);

      const roleLabel = `Removed member role ${randomUUID()}`;
      const { data: createData, errors: createErrors } = await createOneRole({
        expectToFail: false,
        input: {
          label: roleLabel,
          canBeAssignedToUsers: true,
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
      });

      expect(createErrors).toBeUndefined();
      roleId = createData.createOneRole.id;
      jestExpectToBeDefined(roleId);

      const { errors: assignmentErrors } = await updateWorkspaceMemberRole({
        input: { workspaceMemberId, roleId },
        expectToFail: false,
      });

      expect(assignmentErrors).toBeUndefined();

      // A cached assignment must not outlive the member it refers to.
      const roleBeforeRemoval = await findOneRoleByLabel({
        label: roleLabel,
        gqlFields: 'id label workspaceMembers { id }',
      });

      expect(roleBeforeRemoval.workspaceMembers).toEqual([
        expect.objectContaining({ id: workspaceMemberId }),
      ]);

      const { errors: removalErrors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: workspaceMemberId },
        expectToFail: false,
      });

      expect(removalErrors).toBeUndefined();
      workspaceMemberId = undefined;

      const { data, errors } = await deleteOneRole({
        input: { idToDelete: roleId },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.deleteOneRole).toBe(roleId);
      roleId = undefined;
    } finally {
      try {
        if (workspaceMemberId) {
          await deleteUserFromWorkspace({
            input: { workspaceMemberIdToDelete: workspaceMemberId },
            expectToFail: false,
          });
        }
        if (roleId) {
          await deleteOneRole({
            input: { idToDelete: roleId },
            expectToFail: false,
          });
        }
      } finally {
        await updateWorkspace({
          data: { isPublicInviteLinkEnabled: initialPublicInviteLinkEnabled },
          expectToFail: false,
        });
      }
    }
  });

  it('should successfully delete a custom editable role', async () => {
    const { data: createData, errors: createErrors } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Deletable Custom Role',
        description: 'A custom role that can be deleted',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    expect(createErrors).toBeUndefined();
    expect(createData.createOneRole.id).toBeDefined();

    const customRoleId = createData.createOneRole.id;

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: {
        idToDelete: customRoleId,
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.deleteOneRole).toBe(customRoleId);
  });

  it('should delete a custom role and verify it can no longer be found', async () => {
    const testLabel = 'Role To Be Deleted And Verified';

    const { data: createData } = await createOneRole({
      expectToFail: false,
      input: {
        label: testLabel,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    const roleId = createData.createOneRole.id;

    const roleBefore = await findOneRoleByLabel({ label: testLabel });

    expect(roleBefore).toBeDefined();
    expect(roleBefore.id).toBe(roleId);

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: {
        idToDelete: roleId,
      },
    });

    expect(errors).toBeUndefined();
    expect(data.deleteOneRole).toBe(roleId);

    await expect(findOneRoleByLabel({ label: testLabel })).rejects.toThrow(
      `Role with label "${testLabel}" not found`,
    );
  });
});
