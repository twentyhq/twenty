import { randomUUID } from 'node:crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { findWorkspaceCustomApplicationUniversalIdentifier } from 'test/integration/metadata/suites/application/utils/find-workspace-custom-application-universal-identifier.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type LegacyCompliantRoleManifest,
  type Manifest,
} from 'twenty-shared/application';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { type PermissionTestRoleGrant } from 'test/integration/permissions/utils/permission-test-workspace.type';

const buildMarketplaceApplicationManifest = async ({
  name,
  role,
  accessToken,
}: {
  name: string;
  role: LegacyCompliantRoleManifest;
  accessToken: string;
}): Promise<Manifest> => {
  const applicationUniversalIdentifier = randomUUID();

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: name,
    sourcePath: `test-${applicationUniversalIdentifier}`,
    token: accessToken,
  });
  jest.useRealTimers();

  return buildBaseManifest({
    appId: applicationUniversalIdentifier,
    roleId: role.universalIdentifier,
    overrides: { roles: [role] },
  });
};

const buildWorkspaceCustomApplicationManifest = async ({
  role,
  accessToken,
}: {
  role: LegacyCompliantRoleManifest;
  accessToken: string;
}): Promise<Manifest> => {
  const { data } = await exportApplication({
    universalIdentifier:
      await findWorkspaceCustomApplicationUniversalIdentifier(accessToken),
    expectToFail: false,
    token: accessToken,
  });
  const { manifest } = data.exportApplication;

  return {
    ...manifest,
    application: {
      ...manifest.application,
      defaultRoleUniversalIdentifier: role.universalIdentifier,
    },
    roles: [...manifest.roles, role],
  };
};

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
  const isGranted = grant !== 'none';
  // Only the workspace custom application may declare row-level permissions
  const isWorkspaceCustomApplication = grant === 'rowLevel';
  const role: LegacyCompliantRoleManifest = {
    universalIdentifier: randomUUID(),
    label: `${name} role`,
    description: name,
    canUpdateAllSettings: false,
    canReadAllObjectRecords: isGranted,
    canUpdateAllObjectRecords: isGranted,
    canSoftDeleteAllObjectRecords: isGranted,
    canDestroyAllObjectRecords: isGranted,
    ...(isWorkspaceCustomApplication && {
      rowLevelPermissionPredicates: [
        {
          universalIdentifier: randomUUID(),
          objectUniversalIdentifier,
          fieldUniversalIdentifier: rowLevelFilter.fieldUniversalIdentifier,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: rowLevelFilter.value,
        },
      ],
    }),
  };
  const manifest = isWorkspaceCustomApplication
    ? await buildWorkspaceCustomApplicationManifest({ role, accessToken })
    : await buildMarketplaceApplicationManifest({ name, role, accessToken });

  await syncApplication({
    manifest,
    ...(isWorkspaceCustomApplication && {
      inferDeletionFromMissingEntities: false,
    }),
    expectToFail: false,
    token: accessToken,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: manifest.application.universalIdentifier },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });

  return data.findOneApplication.id;
};
