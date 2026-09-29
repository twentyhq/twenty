import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type ApplicationVariableScope,
  type ObjectPermissionManifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

export type ApplicationWithVariable = {
  id: string;
  defaultRoleId: string;
  universalIdentifier: string;
  variableKey: string;
};

// Application settings components need APPLICATIONS by default; tests can
// override the permissions to exercise narrower access.
export const setupApplicationWithVariable = async ({
  name,
  variableKey,
  variableScope,
  isSecret = false,
  permissionFlagUniversalIdentifiers = [SystemPermissionFlag.APPLICATIONS],
  objectPermissions = [],
}: {
  name: string;
  variableKey: string;
  variableScope?: ApplicationVariableScope;
  isSecret?: boolean;
  permissionFlagUniversalIdentifiers?: string[];
  // An application-owned role can only be granted object permissions through
  // its own manifest; upserting them afterwards is refused.
  objectPermissions?: ObjectPermissionManifest[];
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
              scope: variableScope,
              ...(isSecret ? { isSecret: true } : { value: 'initial' }),
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
            canUpdateAllSettings: false,
            permissionFlagUniversalIdentifiers,
            objectPermissions,
          },
        ],
      },
    }),
    expectToFail: false,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    gqlFields: `
      id
      defaultRoleId
    `,
    expectToFail: false,
  });

  const { id, defaultRoleId } = data.findOneApplication;

  if (defaultRoleId === undefined) {
    throw new Error(`Application ${name} synced without its declared role`);
  }

  return {
    id,
    defaultRoleId,
    universalIdentifier: applicationUniversalIdentifier,
    variableKey,
  };
};
