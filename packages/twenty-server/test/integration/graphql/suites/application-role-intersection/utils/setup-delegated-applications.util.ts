import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Every flag the endpoints under test gate on, so the flagged application is a
// control that isolates the refusal to the application's role.
const DELEGATED_PERMISSION_FLAGS = [
  SystemPermissionFlag.WORKSPACE_MEMBERS,
  SystemPermissionFlag.PROFILE_INFORMATION,
  SystemPermissionFlag.WORKSPACE,
  SystemPermissionFlag.BILLING,
  SystemPermissionFlag.VIEWS,
  SystemPermissionFlag.ROLES,
];

// Both applications are granted the blocklist object so that, on every path
// that reaches it, the workspace-scoped settings check is the only gate left
// that can tell them apart.
const BLOCKLIST_OBJECT_PERMISSIONS = [
  {
    objectUniversalIdentifier: STANDARD_OBJECTS.blocklist.universalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
  },
];

export type DelegatedApplications = {
  flaggedApplication: ApplicationWithVariable;
  noFlagApplication: ApplicationWithVariable;
  flaggedApplicationToken: string;
  noFlagApplicationToken: string;
};

// Both tokens are bound to the seeded admin, so they carry that admin's userId
// and userWorkspaceId next to the applicationId.
export const setupDelegatedApplications =
  async (): Promise<DelegatedApplications> => {
    const flaggedApplication = await setupApplicationWithVariable({
      name: 'Flagged Delegated Application',
      variableKey: 'FLAGGED_DELEGATED_APPLICATION_VARIABLE',
      permissionFlagUniversalIdentifiers: DELEGATED_PERMISSION_FLAGS,
      objectPermissions: BLOCKLIST_OBJECT_PERMISSIONS,
    });

    const noFlagApplication = await setupApplicationWithVariable({
      name: 'No Flag Delegated Application',
      variableKey: 'NO_FLAG_DELEGATED_APPLICATION_VARIABLE',
      permissionFlagUniversalIdentifiers: [],
      objectPermissions: BLOCKLIST_OBJECT_PERMISSIONS,
    });

    const [flaggedTokenPair, noFlagTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: flaggedApplication.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: noFlagApplication.id,
      }),
    ]);

    return {
      flaggedApplication,
      noFlagApplication,
      flaggedApplicationToken: flaggedTokenPair.applicationAccessToken.token,
      noFlagApplicationToken: noFlagTokenPair.applicationAccessToken.token,
    };
  };

export const cleanupDelegatedApplications = async ({
  flaggedApplication,
  noFlagApplication,
}: Pick<
  DelegatedApplications,
  'flaggedApplication' | 'noFlagApplication'
>): Promise<void> => {
  await cleanupApplicationAndAppRegistration({
    applicationUniversalIdentifier: flaggedApplication.universalIdentifier,
  });
  await cleanupApplicationAndAppRegistration({
    applicationUniversalIdentifier: noFlagApplication.universalIdentifier,
  });
};
