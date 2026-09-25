import { randomUUID } from 'crypto';

import { checkoutSession } from 'test/integration/graphql/suites/user-session/utils/checkout-session.util';
import {
  createWorkspaceBlocklistEntry,
  destroyWorkspaceBlocklistEntry,
} from 'test/integration/graphql/suites/application-role-intersection/utils/create-workspace-blocklist-entry.util';
import { deleteBlocklistEntryThroughMcp } from 'test/integration/graphql/suites/application-role-intersection/utils/delete-blocklist-entry-through-mcp.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { findObjectMetadataIdByName } from 'test/integration/graphql/suites/application-role-intersection/utils/find-object-metadata-id-by-name.util';
import {
  cleanupDelegatedApplications,
  type DelegatedApplications,
  setupDelegatedApplications,
} from 'test/integration/graphql/suites/application-role-intersection/utils/setup-delegated-applications.util';
import { updateWorkspaceMemberSettings } from 'test/integration/graphql/suites/application-role-intersection/utils/update-workspace-member-settings.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { uploadWorkspaceMemberProfilePicture } from 'test/integration/graphql/suites/application-role-intersection/utils/upload-workspace-member-profile-picture.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import {
  countWorkspaceBlocklistEntries,
  countWorkspaceFiles,
  readWorkspaceDisplayName,
  readWorkspaceMemberTimeZone,
  workspaceBlocklistEntryExists,
  workspaceMemberExists,
} from 'test/integration/graphql/suites/application-role-intersection/utils/read-target-state.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type TestContext = {
  attempt: (token: string) => Promise<{ errors: BaseGraphQLError[] }>;
  // Absent only where the refused call has nothing to persist in this
  // environment, which the case documents.
  readTarget?: () => Promise<unknown>;
};

let viewId: string;
const VIEW_NAME = `Delegated intersection view ${randomUUID()}`;

const testCases: EachTestingContext<TestContext>[] = [
  {
    title: 'updateWorkspaceMemberSettings on another member',
    context: {
      attempt: (token) =>
        updateWorkspaceMemberSettings({
          input: {
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            update: { timeZone: 'Europe/Paris' },
          },
          token,
          expectToFail: true,
        }),
      readTarget: () =>
        readWorkspaceMemberTimeZone(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY),
    },
  },
  {
    title: 'deleteUserFromWorkspace for another member',
    context: {
      attempt: (token) =>
        deleteUserFromWorkspace({
          input: {
            workspaceMemberIdToDelete: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          },
          token,
          expectToFail: true,
        }),
      readTarget: () =>
        workspaceMemberExists(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY),
    },
  },
  {
    title: 'updateWorkspace',
    context: {
      attempt: (token) =>
        updateWorkspace({
          data: { displayName: `Renamed by an app ${randomUUID()}` },
          token,
          expectToFail: true,
        }),
      readTarget: readWorkspaceDisplayName,
    },
  },
  {
    // A refused checkout persists nothing to read back, so the refusal itself is
    // the whole observable effect.
    title: 'the billing checkout permission path',
    context: {
      attempt: (token) =>
        checkoutSession({
          input: { recurringInterval: 'Month' },
          token,
          expectToFail: true,
        }),
    },
  },
  {
    title: 'a view mutation',
    context: {
      attempt: (token) =>
        updateOneView({
          viewId,
          input: { id: viewId, name: `Renamed by an app ${randomUUID()}` },
          token,
          expectToFail: true,
        }),
      readTarget: async () => {
        const { data } = await findOneView({ viewId, expectToFail: false });

        return data.getView.name;
      },
    },
  },
  {
    title: 'the profile picture upload',
    context: {
      attempt: (token) =>
        uploadWorkspaceMemberProfilePicture({ token, expectToFail: true }),
      readTarget: countWorkspaceFiles,
    },
  },
  // The application's role is granted the blocklist object below, so only the
  // workspace-scoped settings check can refuse this one.
  {
    title: 'a workspace-scoped blocklist entry',
    context: {
      attempt: (token) => createWorkspaceBlocklistEntry({ token }),
      readTarget: countWorkspaceBlocklistEntries,
    },
  },
];

describe('A delegated application without the flag is refused', () => {
  let delegatedApplications: DelegatedApplications;

  beforeAll(async () => {
    delegatedApplications = await setupDelegatedApplications();

    const { data } = await createOneView({
      input: {
        name: VIEW_NAME,
        objectMetadataId: await findObjectMetadataIdByName('company'),
        icon: 'IconTable',
      },
      expectToFail: false,
    });

    viewId = data.createView.id;
  }, 180000);

  afterAll(async () => {
    await destroyOneView({ viewId, expectToFail: false });
    await cleanupDelegatedApplications(delegatedApplications);
  }, 120000);

  it.each(eachTestingContextFilter(testCases))(
    'should refuse $title',
    async ({ context }) => {
      const targetBefore = await context.readTarget?.();

      const { errors } = await context.attempt(
        delegatedApplications.noFlagApplicationToken,
      );

      expectOneNotInternalServerErrorSnapshot({ errors });

      expect(await context.readTarget?.()).toEqual(targetBefore);
    },
  );

  // Lockout protection covers the roles the caller depends on. An application
  // acting for a member depends on its own declared role as much as on the
  // member's, so deleting it must be refused even though the member's role,
  // and the ROLES flag it needs to get here, say otherwise.
  it('should refuse a delegated application deleting its own declared role', async () => {
    const { flaggedApplication, flaggedApplicationToken } =
      delegatedApplications;

    const { errors } = await deleteOneRole({
      input: { idToDelete: flaggedApplication.defaultRoleId },
      token: flaggedApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    const { data } = await findOneApplication({
      input: { id: flaggedApplication.id },
      gqlFields: `
        id
        defaultRoleId
      `,
      expectToFail: false,
    });

    expect(data.findOneApplication.defaultRoleId).toBe(
      flaggedApplication.defaultRoleId,
    );
  });

  // Database tools rebuild the auth context from the caller's identity, so
  // the application has to survive that rebuild for the settings check to
  // see it. The same delete over GraphQL is covered by the cases above.
  it('should refuse deleting a workspace-scoped blocklist entry through an MCP tool', async () => {
    const { data, errors } = await createWorkspaceBlocklistEntry({});

    expect(errors).toBeUndefined();

    const blocklistEntryId = data?.createBlocklist.id as string;

    try {
      const result = await deleteBlocklistEntryThroughMcp({
        blocklistEntryId,
        token: delegatedApplications.noFlagApplicationToken,
      });

      expect(result.isError).toBe(true);
      expect(await workspaceBlocklistEntryExists(blocklistEntryId)).toBe(true);
    } finally {
      await destroyWorkspaceBlocklistEntry(blocklistEntryId);
    }
  });
});
