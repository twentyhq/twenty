import { randomUUID } from 'node:crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { type PermissionTestRoleGrant } from 'test/integration/permissions/utils/permission-test-workspace.type';

export const createPermissionTestApplication = async ({
  name,
  grant,
  rowLevelFilter,
  objectUniversalIdentifier,
  accessToken,
}: {
  name: string;
  grant: PermissionTestRoleGrant;
  rowLevelFilter: { fieldUniversalIdentifier: string; value: string };
  objectUniversalIdentifier: string;
  accessToken: string;
}) => {
  const applicationUniversalIdentifier = randomUUID();
  const roleUniversalIdentifier = randomUUID();
  const isGranted = grant !== 'none';

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: name,
    sourcePath: `test-${applicationUniversalIdentifier}`,
    token: accessToken,
  });
  jest.useRealTimers();

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `${name} role`,
            description: name,
            canUpdateAllSettings: false,
            canReadAllObjectRecords: isGranted,
            canUpdateAllObjectRecords: isGranted,
            canSoftDeleteAllObjectRecords: isGranted,
            canDestroyAllObjectRecords: isGranted,
            ...(grant === 'rowLevel' && {
              rowLevelPermissionPredicates: [
                {
                  universalIdentifier: randomUUID(),
                  objectUniversalIdentifier,
                  fieldUniversalIdentifier:
                    rowLevelFilter.fieldUniversalIdentifier,
                  operand: RowLevelPermissionPredicateOperand.IS,
                  value: rowLevelFilter.value,
                },
              ],
            }),
          },
        ],
      },
    }),
    expectToFail: false,
    token: accessToken,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });

  return data.findOneApplication.id;
};
