import { randomUUID } from 'crypto';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { WorkspaceDiscoverability } from 'src/engine/core-modules/workspace/types/workspace-discoverability.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

type WorkspaceAccessSettings = {
  defaultRoleId: string | null;
  inviteHash: string | null;
  isPublicInviteLinkEnabled: boolean;
  workspaceDiscoverability: WorkspaceDiscoverability;
  allowImpersonation: boolean;
  isGoogleAuthEnabled: boolean;
  isMicrosoftAuthEnabled: boolean;
  isPasswordAuthEnabled: boolean;
  isTwoFactorAuthenticationEnforced: boolean;
  editableProfileFields: string[] | null;
  subdomain: string;
  customDomain: string | null;
  eventLogRetentionDays: number;
};

type GlobalTestContext = {
  application: ApplicationWithVariable;
  adminRoleId: string;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type FieldTestContext = {
  update: (params: {
    settings: WorkspaceAccessSettings;
    adminRoleId: string;
  }) => UpdateWorkspaceInput;
};

// Every flag these settings gate on, so a missing permission is never what
// refuses the application.
const ACCESS_SETTINGS_PERMISSION_FLAGS = [
  SystemPermissionFlag.WORKSPACE,
  SystemPermissionFlag.WORKSPACE_MEMBERS,
  SystemPermissionFlag.SECURITY,
  SystemPermissionFlag.ROLES,
];

const tokenTestCases: EachTestingContext<TokenTestContext>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

// Each update moves the setting away from its current value, so an accepted
// update would show in the workspace row.
const fieldTestCases: EachTestingContext<FieldTestContext>[] = [
  {
    title: 'defaultRoleId',
    context: { update: ({ adminRoleId }) => ({ defaultRoleId: adminRoleId }) },
  },
  {
    title: 'inviteHash',
    context: {
      update: () => ({ inviteHash: `application-token-probe-${randomUUID()}` }),
    },
  },
  {
    title: 'isPublicInviteLinkEnabled',
    context: {
      update: ({ settings }) => ({
        isPublicInviteLinkEnabled: !settings.isPublicInviteLinkEnabled,
      }),
    },
  },
  {
    title: 'workspaceDiscoverability',
    context: {
      update: ({ settings }) => ({
        workspaceDiscoverability:
          settings.workspaceDiscoverability === WorkspaceDiscoverability.PUBLIC
            ? WorkspaceDiscoverability.HIDDEN
            : WorkspaceDiscoverability.PUBLIC,
      }),
    },
  },
  {
    title: 'allowImpersonation',
    context: {
      update: ({ settings }) => ({
        allowImpersonation: !settings.allowImpersonation,
      }),
    },
  },
  {
    title: 'isGoogleAuthEnabled',
    context: {
      update: ({ settings }) => ({
        isGoogleAuthEnabled: !settings.isGoogleAuthEnabled,
      }),
    },
  },
  {
    title: 'isMicrosoftAuthEnabled',
    context: {
      update: ({ settings }) => ({
        isMicrosoftAuthEnabled: !settings.isMicrosoftAuthEnabled,
      }),
    },
  },
  {
    title: 'isPasswordAuthEnabled',
    context: {
      update: ({ settings }) => ({
        isPasswordAuthEnabled: !settings.isPasswordAuthEnabled,
      }),
    },
  },
  {
    title: 'isTwoFactorAuthenticationEnforced',
    context: {
      update: ({ settings }) => ({
        isTwoFactorAuthenticationEnforced:
          !settings.isTwoFactorAuthenticationEnforced,
      }),
    },
  },
  {
    title: 'editableProfileFields',
    context: {
      update: ({ settings }) => ({
        editableProfileFields: (settings.editableProfileFields ?? []).includes(
          'email',
        )
          ? (settings.editableProfileFields ?? []).filter(
              (field) => field !== 'email',
            )
          : [...(settings.editableProfileFields ?? []), 'email'],
      }),
    },
  },
  {
    title: 'subdomain',
    context: {
      update: () => ({
        subdomain: `probe-${randomUUID().slice(0, 8)}`,
      }),
    },
  },
  {
    title: 'customDomain',
    context: {
      update: () => ({
        customDomain: `probe-${randomUUID().slice(0, 8)}.example.com`,
      }),
    },
  },
  {
    title: 'eventLogRetentionDays',
    context: {
      update: ({ settings }) => ({
        eventLogRetentionDays: settings.eventLogRetentionDays + 1,
      }),
    },
  },
];

const readWorkspaceAccessSettings =
  async (): Promise<WorkspaceAccessSettings> => {
    const [settings] = await globalThis.testDataSource.query(
      `SELECT "defaultRoleId", "inviteHash", "isPublicInviteLinkEnabled",
              "workspaceDiscoverability", "allowImpersonation",
              "isGoogleAuthEnabled", "isMicrosoftAuthEnabled",
              "isPasswordAuthEnabled", "isTwoFactorAuthenticationEnforced",
              "editableProfileFields", "subdomain", "customDomain",
              "eventLogRetentionDays"
       FROM core."workspace" WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    return settings;
  };

const countInvitations = async (email: string): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core."appToken"
     WHERE "workspaceId" = $1 AND context ->> 'email' = $2`,
    [SEED_APPLE_WORKSPACE_ID, email],
  );

  return count;
};

describe('Workspace access settings with an application token should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const application = await setupApplicationWithVariable({
      name: 'Workspace Access Probe',
      variableKey: 'WORKSPACE_ACCESS_PROBE',
      permissionFlagUniversalIdentifiers: ACCESS_SETTINGS_PERMISSION_FLAGS,
    });

    const [adminRole] = await globalThis.testDataSource.query(
      `SELECT id FROM core."role" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [STANDARD_ROLE.admin.universalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({ applicationId: application.id }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
      adminRoleId: adminRole.id,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(fieldTestCases))(
        'should refuse to update $title, which stays unchanged',
        async ({ context }) => {
          const settingsBeforeAttempt = await readWorkspaceAccessSettings();

          const { errors } = await updateWorkspace({
            data: context.update({
              settings: settingsBeforeAttempt,
              adminRoleId: globalTestContext.adminRoleId,
            }),
            token: tokenContext.token(globalTestContext),
            expectToFail: true,
          });

          expectOneNotInternalServerErrorSnapshot({ errors });
          expect(await readWorkspaceAccessSettings()).toEqual(
            settingsBeforeAttempt,
          );
        },
      );

      it('should not read the invite link', async () => {
        const { data } = await findCurrentWorkspaceInviteHash({
          token: tokenContext.token(globalTestContext),
          expectToFail: false,
        });

        expect(data.currentWorkspace.inviteHash).toBeNull();
      });
    },
  );

  it.each([
    { title: 'with the admin role', withAdminRole: true },
    { title: 'without a role', withAdminRole: false },
  ])(
    'should refuse an invitation $title, creating no invitation',
    async ({ withAdminRole }) => {
      const email = `application-token-probe-${randomUUID()}@example.com`;

      const { errors } = await sendInvitations({
        input: {
          emails: [email],
          roleId: withAdminRole ? globalTestContext.adminRoleId : undefined,
        },
        token: globalTestContext.userBoundToken,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(await countInvitations(email)).toBe(0);
    },
  );

  it('should still give the invite link to an admin session', async () => {
    const { data } = await findCurrentWorkspaceInviteHash({
      expectToFail: false,
    });

    expect(data.currentWorkspace.inviteHash).toEqual(
      (await readWorkspaceAccessSettings()).inviteHash,
    );
    expect(data.currentWorkspace.inviteHash).not.toBeNull();
  });
});
