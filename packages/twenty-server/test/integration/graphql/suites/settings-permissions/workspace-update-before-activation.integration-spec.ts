import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WORKSPACE_FIELDS_UPDATABLE_BEFORE_ACTIVATION } from 'src/engine/core-modules/workspace/constants/workspace-fields-updatable-before-activation.constant';
import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Every allowlisted field needs a value here, so adding one to the constant
// without covering it fails to compile.
const SETUP_FIELD_VALUES = {
  displayName: `Pending setup ${Date.now()}`,
  subdomain: `pending-setup-${Date.now()}`,
  logo: 'pending-setup-logo.png',
} satisfies Record<
  keyof typeof WORKSPACE_FIELDS_UPDATABLE_BEFORE_ACTIVATION,
  string
>;

const setActivationStatus = (activationStatus: WorkspaceActivationStatus) =>
  testDataSource.query(
    'UPDATE core.workspace SET "activationStatus" = $1 WHERE id = $2',
    [activationStatus, SEED_APPLE_WORKSPACE_ID],
  );

describe('updateWorkspace while the workspace is pending creation', () => {
  let originalDisplayName: string;
  let originalSubdomain: string;
  let originalLogo: string | null;
  let originalAllowImpersonation: boolean;

  beforeAll(async () => {
    const [workspace] = await testDataSource.query(
      'SELECT "displayName", "subdomain", "logo", "allowImpersonation" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    originalDisplayName = workspace.displayName;
    originalSubdomain = workspace.subdomain;
    originalLogo = workspace.logo;
    originalAllowImpersonation = workspace.allowImpersonation;

    await setActivationStatus(WorkspaceActivationStatus.PENDING_CREATION);
  });

  afterAll(async () => {
    await setActivationStatus(WorkspaceActivationStatus.ACTIVE);

    await testDataSource.query(
      'UPDATE core.workspace SET "displayName" = $1, "subdomain" = $2, "logo" = $3 WHERE id = $4',
      [
        originalDisplayName,
        originalSubdomain,
        originalLogo,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );
  });

  it('rejects security sensitive fields', async () => {
    const { data, errors } = await updateWorkspace({
      data: { allowImpersonation: !originalAllowImpersonation },
      expectToFail: true,
    });

    expect(data?.updateWorkspace).toBeFalsy();
    expectOneNotInternalServerErrorSnapshot({ errors });

    const [workspace] = await testDataSource.query(
      'SELECT "allowImpersonation" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.allowImpersonation).toBe(originalAllowImpersonation);
  });

  it('rejects the whole update when a setup field is mixed with a security sensitive one', async () => {
    const { data, errors } = await updateWorkspace({
      data: {
        displayName: 'Should not be applied',
        isPublicInviteLinkEnabled: true,
      },
      expectToFail: true,
    });

    expect(data?.updateWorkspace).toBeFalsy();
    expectOneNotInternalServerErrorSnapshot({ errors });

    const [workspace] = await testDataSource.query(
      'SELECT "displayName" FROM core.workspace WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(workspace.displayName).toBe(originalDisplayName);
  });

  it.each(Object.entries(SETUP_FIELD_VALUES))(
    'still allows %s, which is needed to set the workspace up',
    async (field, value) => {
      const { data, errors } = await updateWorkspace({
        data: { [field]: value } as UpdateWorkspaceInput,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.updateWorkspace.id).toBe(SEED_APPLE_WORKSPACE_ID);

      const [workspace] = await testDataSource.query(
        `SELECT "${field}" FROM core.workspace WHERE id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

      expect(workspace[field]).toBe(value);
    },
  );
});
