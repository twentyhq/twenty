import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

export type ApplicationWithVariable = {
  id: string;
  universalIdentifier: string;
  variableKey: string;
};

// Syncs an application whose default role holds APPLICATIONS by default, as the
// official apps with a settings component do, and declares one non-secret
// variable. The flags are a parameter so a caller can give the application role
// a workspace permission instead.
export const setupApplicationWithVariable = async ({
  name,
  variableKey,
  permissionFlagUniversalIdentifiers = [SystemPermissionFlag.APPLICATIONS],
}: {
  name: string;
  variableKey: string;
  permissionFlagUniversalIdentifiers?: string[];
}): Promise<ApplicationWithVariable> => {
  const applicationUniversalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: `${name} for application variable access tests`,
    sourcePath: `test-${applicationUniversalIdentifier}`,
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        application: {
          universalIdentifier: applicationUniversalIdentifier,
          defaultRoleUniversalIdentifier: roleUniversalIdentifier,
          displayName: name,
          description: `${name} for application variable access tests`,
          applicationVariables: {
            [variableKey]: {
              universalIdentifier: uuidv4(),
              value: 'initial',
            },
          },
          packageJsonChecksum: null,
          yarnLockChecksum: null,
        },
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `${name} role`,
            description: 'Manages applications',
            permissionFlagUniversalIdentifiers,
          },
        ],
      },
    }),
    expectToFail: false,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    expectToFail: false,
  });

  return {
    id: data.findOneApplication.id,
    universalIdentifier: applicationUniversalIdentifier,
    variableKey,
  };
};
