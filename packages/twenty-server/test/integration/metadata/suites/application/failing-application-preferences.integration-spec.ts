import { randomUUID } from 'crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { expectPermissionDenied } from 'test/integration/metadata/suites/application/utils/expect-permission-denied.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationPreferences } from 'test/integration/metadata/suites/application/utils/my-application-preferences.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('My application preferences should fail', () => {
  let application: ApplicationWithVariable;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Application Preferences Caller Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });

    const janeApplicationTokenPair =
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      });

    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should refuse an API key', async () => {
    const { errors } = await myApplicationPreferences({
      input: {},
      token: API_KEY_ACCESS_TOKEN,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token, even one a member is behind', async () => {
    const { errors } = await myApplicationPreferences({
      input: {},
      token: janeApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a guest whose role lacks the User Apps permission', async () => {
    const { data, errors } = await myApplicationPreferences({
      input: {},
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });

  describe('for a member whose role lacks the User Apps permission', () => {
    let memberRoleId: string;
    let customRoleId: string;

    beforeAll(async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });

      memberRoleId = memberRole.id;

      const { data } = await createOneRole({
        expectToFail: false,
        input: {
          label: `Application preferences denied role ${randomUUID()}`,
          description: 'Member role without the User Apps permission',
          icon: 'IconUser',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: false,
          canBeAssignedToApiKeys: false,
        },
      });

      const createdRoleId = data?.createOneRole?.id;

      jestExpectToBeDefined(createdRoleId);
      customRoleId = createdRoleId;

      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: customRoleId,
        },
        expectToFail: false,
      });
    });

    afterAll(async () => {
      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: memberRoleId,
        },
        expectToFail: false,
      });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: customRoleId },
      });
    });

    it('should refuse the member', async () => {
      const { data, errors } = await myApplicationPreferences({
        input: {},
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(data).toBeNull();
      expectPermissionDenied(errors);
    });
  });
});
