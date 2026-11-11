import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { findApplicationRoleIds } from 'test/integration/metadata/suites/application-grant-role/utils/find-application-role-ids.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationAccessToken } from 'test/integration/utils/generate-application-access-token.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const CONFINED_APPLICATION_VERSION = '1.0.0';
const CONFINED_APPLICATION_AGENT_NAME = 'grant-role-agent';

export type GrantRoleApplications = {
  confinedApplicationId: string;
  confinedApplicationUniversalIdentifier: string;
  localApplicationId: string;
  localApplicationUniversalIdentifier: string;
  twentyStandardApplicationId: string;
  workspaceCustomApplicationId: string;
  oAuthOnlyApplicationId: string;
  invoiceObjectNameSingular: string;
  tokens: {
    confinedApplicationAlone: string;
    confinedApplicationForAdminMember: string;
    confinedApplicationAgent: string;
    localApplicationAlone: string;
    twentyStandardForAdminMember: string;
    workspaceCustomApplicationAlone: string;
    oAuthOnlyApplicationForAdminMember: string;
    oAuthOnlyApplicationAlone: string;
  };
};

const generateApplicationAloneToken = (applicationId: string) =>
  generateApplicationAccessToken({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId,
  });

const generateApplicationForAdminMemberToken = async (
  applicationId: string,
) => {
  const { applicationAccessToken } =
    await generateAppleAdminApplicationTokenPair({ applicationId });

  return applicationAccessToken.token;
};

const installConfinedApplication = async ({
  applicationUniversalIdentifier,
  invoiceObjectNameSingular,
  invoiceObjectNamePlural,
}: {
  applicationUniversalIdentifier: string;
  invoiceObjectNameSingular: string;
  invoiceObjectNamePlural: string;
}) => {
  const requestedRoleUniversalIdentifier = uuidv4();
  const agentRoleUniversalIdentifier = uuidv4();

  const tarball = await createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: requestedRoleUniversalIdentifier,
        overrides: {
          roles: [
            {
              universalIdentifier: requestedRoleUniversalIdentifier,
              label: `${invoiceObjectNameSingular} requested role`,
              canBeAssignedToUsers: false,
              canReadAllObjectRecords: true,
              canUpdateAllObjectRecords: true,
              canSoftDeleteAllObjectRecords: true,
              canDestroyAllObjectRecords: true,
              objectPermissions: [
                {
                  objectUniversalIdentifier:
                    STANDARD_OBJECTS.company.universalIdentifier,
                  canReadObjectRecords: true,
                  canUpdateObjectRecords: false,
                  canSoftDeleteObjectRecords: false,
                  canDestroyObjectRecords: false,
                },
              ],
            },
            {
              universalIdentifier: agentRoleUniversalIdentifier,
              label: `${invoiceObjectNameSingular} agent role`,
              canBeAssignedToUsers: false,
              canBeAssignedToAgents: true,
              canReadAllObjectRecords: true,
              canUpdateAllObjectRecords: true,
            },
          ],
          agents: [
            {
              universalIdentifier: uuidv4(),
              name: CONFINED_APPLICATION_AGENT_NAME,
              label: 'Grant role agent',
              prompt: 'You read and update records.',
              roleUniversalIdentifier: agentRoleUniversalIdentifier,
            },
          ],
          objects: [
            {
              ...buildDefaultObjectManifest({
                nameSingular: invoiceObjectNameSingular,
                namePlural: invoiceObjectNamePlural,
                labelSingular: 'Grant role invoice',
                labelPlural: 'Grant role invoices',
                applicationUniversalIdentifier,
              }),
              disabledObjectPermissionActions: ['canDestroyObjectRecords'],
            },
          ],
        },
      }),
    ),
    'package.json': JSON.stringify({
      name: `test-application-grant-role-${applicationUniversalIdentifier}`,
      version: CONFINED_APPLICATION_VERSION,
    }),
  });

  const { errors: uploadErrors } = await uploadAppTarball({
    tarballBuffer: tarball,
    universalIdentifier: applicationUniversalIdentifier,
  });

  expect(uploadErrors).toBeUndefined();

  const { errors: installErrors } = await installApplication({
    input: {
      universalIdentifier: applicationUniversalIdentifier,
      version: CONFINED_APPLICATION_VERSION,
    },
    expectToFail: false,
  });

  expect(installErrors).toBeUndefined();
};

const syncLocalApplication = async ({
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
}) => {
  const requestedRoleUniversalIdentifier = uuidv4();

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name: 'Grant role local application',
    description: 'Local application acting with its grant role',
    sourcePath: `test-application-grant-role-${applicationUniversalIdentifier}`,
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: requestedRoleUniversalIdentifier,
      overrides: {
        roles: [
          {
            universalIdentifier: requestedRoleUniversalIdentifier,
            label: 'Grant role local requested role',
            canBeAssignedToUsers: false,
            canReadAllObjectRecords: true,
          },
        ],
      },
    }),
    expectToFail: false,
  });
};

const findConfinedApplicationAgentId = async (applicationId: string) => {
  const { data } = await findAgents({
    gqlFields: 'id name applicationId',
    expectToFail: false,
    input: undefined,
  });

  const agentId = data.findManyAgents.find(
    (agent) =>
      agent.applicationId === applicationId &&
      agent.name === CONFINED_APPLICATION_AGENT_NAME,
  )?.id;

  if (!isDefined(agentId)) {
    throw new Error('The confined application agent was not installed');
  }

  return agentId;
};

export const setupGrantRoleApplications = async ({
  invoiceObjectNameSingular,
  invoiceObjectNamePlural,
}: {
  invoiceObjectNameSingular: string;
  invoiceObjectNamePlural: string;
}): Promise<GrantRoleApplications> => {
  const confinedApplicationUniversalIdentifier = uuidv4();
  const localApplicationUniversalIdentifier = uuidv4();

  await installConfinedApplication({
    applicationUniversalIdentifier: confinedApplicationUniversalIdentifier,
    invoiceObjectNameSingular,
    invoiceObjectNamePlural,
  });
  await syncLocalApplication({
    applicationUniversalIdentifier: localApplicationUniversalIdentifier,
  });

  const oAuthOnlyApplicationForAdminMemberToken = await loginAsTwentyCli();

  const [
    { id: confinedApplicationId },
    { id: localApplicationId },
    { id: twentyStandardApplicationId },
    { id: oAuthOnlyApplicationId },
    workspaceCustomApplicationId,
  ] = await Promise.all([
    findApplicationRoleIds({
      input: { universalIdentifier: confinedApplicationUniversalIdentifier },
    }),
    findApplicationRoleIds({
      input: { universalIdentifier: localApplicationUniversalIdentifier },
    }),
    findApplicationRoleIds({
      input: {
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
    }),
    findApplicationRoleIds({
      input: {
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      },
    }),
    findWorkspaceCustomApplicationId(),
  ]);

  return {
    confinedApplicationId,
    confinedApplicationUniversalIdentifier,
    localApplicationId,
    localApplicationUniversalIdentifier,
    twentyStandardApplicationId,
    workspaceCustomApplicationId,
    oAuthOnlyApplicationId,
    invoiceObjectNameSingular,
    tokens: {
      confinedApplicationAlone: await generateApplicationAloneToken(
        confinedApplicationId,
      ),
      confinedApplicationForAdminMember:
        await generateApplicationForAdminMemberToken(confinedApplicationId),
      confinedApplicationAgent: await generateApplicationAccessToken({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: confinedApplicationId,
        agentId: await findConfinedApplicationAgentId(confinedApplicationId),
      }),
      localApplicationAlone:
        await generateApplicationAloneToken(localApplicationId),
      twentyStandardForAdminMember:
        await generateApplicationForAdminMemberToken(
          twentyStandardApplicationId,
        ),
      workspaceCustomApplicationAlone: await generateApplicationAloneToken(
        workspaceCustomApplicationId,
      ),
      oAuthOnlyApplicationForAdminMember:
        oAuthOnlyApplicationForAdminMemberToken,
      oAuthOnlyApplicationAlone: await generateApplicationAloneToken(
        oAuthOnlyApplicationId,
      ),
    },
  };
};

export const cleanupGrantRoleApplications = async ({
  confinedApplicationUniversalIdentifier,
  localApplicationUniversalIdentifier,
}: Pick<
  GrantRoleApplications,
  | 'confinedApplicationUniversalIdentifier'
  | 'localApplicationUniversalIdentifier'
>): Promise<void> => {
  await cleanupApplicationAndAppRegistration({
    applicationUniversalIdentifier: confinedApplicationUniversalIdentifier,
  });
  await cleanupApplicationAndAppRegistration({
    applicationUniversalIdentifier: localApplicationUniversalIdentifier,
  });
  await uninstallApplication({
    universalIdentifier:
      TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    expectToFail: false,
  });
};
