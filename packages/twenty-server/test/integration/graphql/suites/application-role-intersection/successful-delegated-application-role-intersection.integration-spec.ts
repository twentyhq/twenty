import { randomUUID } from 'crypto';

import { checkoutSession } from 'test/integration/graphql/suites/user-session/utils/checkout-session.util';
import { createWorkspaceBlocklistEntry } from 'test/integration/graphql/suites/application-role-intersection/utils/create-workspace-blocklist-entry.util';
import { deleteBlocklistEntryThroughMcp } from 'test/integration/graphql/suites/application-role-intersection/utils/delete-blocklist-entry-through-mcp.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { findObjectMetadataIdByName } from 'test/integration/graphql/suites/application-role-intersection/utils/find-object-metadata-id-by-name.util';
import {
  readWorkspaceDisplayName,
  workspaceBlocklistEntryExists,
} from 'test/integration/graphql/suites/application-role-intersection/utils/read-target-state.util';
import {
  cleanupDelegatedApplications,
  type DelegatedApplications,
  setupDelegatedApplications,
} from 'test/integration/graphql/suites/application-role-intersection/utils/setup-delegated-applications.util';
import { updateWorkspaceMemberSettings } from 'test/integration/graphql/suites/application-role-intersection/utils/update-workspace-member-settings.util';
import { uploadWorkspaceMemberProfilePicture } from 'test/integration/graphql/suites/application-role-intersection/utils/upload-workspace-member-profile-picture.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';

import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const findWorkspaceMemberIdByEmail = async (
  userEmail: string,
): Promise<string | undefined> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields: 'id',
      filter: { userEmail: { eq: userEmail } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workspaceMembers.edges[0]?.node.id;
};

describe('A delegated application holding the flag acts like the session', () => {
  let delegatedApplications: DelegatedApplications;
  let viewId: string;
  let initialWorkspaceDisplayName: string;

  beforeAll(async () => {
    delegatedApplications = await setupDelegatedApplications();
    initialWorkspaceDisplayName = await readWorkspaceDisplayName();

    const { data } = await createOneView({
      input: {
        name: `Delegated control view ${randomUUID()}`,
        objectMetadataId: await findObjectMetadataIdByName('company'),
        icon: 'IconTable',
      },
      expectToFail: false,
    });

    viewId = data.createView.id;
  }, 180000);

  afterAll(async () => {
    await updateWorkspace({
      data: { displayName: initialWorkspaceDisplayName },
      expectToFail: false,
    });
    await destroyOneView({ viewId, expectToFail: false });
    await cleanupDelegatedApplications(delegatedApplications);
  }, 120000);

  describe.each([
    { title: 'from the admin session', token: () => undefined },
    {
      title: 'from the flagged application',
      token: () => delegatedApplications.flaggedApplicationToken,
    },
  ])('$title', ({ token }) => {
    it('should update another workspace member', async () => {
      const timeZone = 'Europe/Lisbon';

      const { data } = await updateWorkspaceMemberSettings({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: { timeZone },
        },
        token: token(),
        expectToFail: false,
      });

      expect(data.updateWorkspaceMemberSettings).toBe(true);
    });

    it('should update the workspace', async () => {
      const displayName = `Delegated control workspace ${randomUUID()}`;

      const { data } = await updateWorkspace({
        data: { displayName },
        token: token(),
        expectToFail: false,
      });

      expect(data.updateWorkspace.id).toBeDefined();
      expect(await readWorkspaceDisplayName()).toBe(displayName);
    });

    it('should update a view', async () => {
      const name = `Delegated control view ${randomUUID()}`;

      const { data } = await updateOneView({
        viewId,
        input: { id: viewId, name },
        token: token(),
        expectToFail: false,
      });

      expect(data.updateView.name).toBe(name);
    });

    it('should upload a profile picture', async () => {
      const { data } = await uploadWorkspaceMemberProfilePicture({
        token: token(),
        expectToFail: false,
      });

      expect(data.uploadWorkspaceMemberProfilePicture.id).toBeDefined();
    });

    // The fake Stripe key in the integration environment makes the call fail
    // downstream either way. What matters is that it is no longer the gate.
    it('should clear the billing checkout permission gate', async () => {
      const { errors } = await checkoutSession({
        input: { recurringInterval: 'Month' },
        token: token(),
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors[0].message).not.toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
    });

    it('should delete another member from the workspace', async () => {
      const userEmail = `delegated-control-${randomUUID()}@example.com`;

      await signUpInWorkspaceAndGetAccessToken(userEmail);

      const workspaceMemberId = await findWorkspaceMemberIdByEmail(userEmail);

      expect(workspaceMemberId).toBeDefined();

      const { data } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: workspaceMemberId as string },
        token: token(),
        expectToFail: false,
      });

      expect(data.deleteUserFromWorkspace.id).toBeDefined();
      expect(await findWorkspaceMemberIdByEmail(userEmail)).toBeUndefined();
    });

    it('should delete a workspace-scoped blocklist entry through an MCP tool', async () => {
      const { data, errors } = await createWorkspaceBlocklistEntry({});

      expect(errors).toBeUndefined();

      const blocklistEntryId = data?.createBlocklist.id as string;

      const result = await deleteBlocklistEntryThroughMcp({
        blocklistEntryId,
        token: token() ?? APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(result.isError).toBe(false);
      expect(await workspaceBlocklistEntryExists(blocklistEntryId)).toBe(false);
    });
  });
});
