import { createPermissionTestWorkspace } from 'test/integration/permissions/utils/create-permission-test-workspace.util';
import { describePermissionTestRecordAccess } from 'test/integration/permissions/utils/describe-permission-test-record-access.util';
import { type PermissionTestWorkspace } from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

const WORKSPACE_LIFECYCLE_TIMEOUT_MS = 120000;

export const describePermissionTestWorkspace = ({
  name,
  defineTests,
}: {
  name: string;
  defineTests: (tools: {
    findWorkspace: () => PermissionTestWorkspace;
    describeRecordAccess: (
      recordAccess: Omit<
        Parameters<typeof describePermissionTestRecordAccess>[0],
        'findWorkspace'
      >,
    ) => void;
  }) => void;
}) =>
  describe(name, () => {
    let workspace: PermissionTestWorkspace;

    const findWorkspace = () => workspace;

    beforeAll(async () => {
      jest.useRealTimers();

      workspace = await createPermissionTestWorkspace();
    }, WORKSPACE_LIFECYCLE_TIMEOUT_MS);

    afterAll(async () => {
      await getAppProviderByClassName<WorkspaceService>(
        'WorkspaceService',
      ).deleteWorkspace(workspace.workspaceId);
    }, WORKSPACE_LIFECYCLE_TIMEOUT_MS);

    defineTests({
      findWorkspace,
      describeRecordAccess: (recordAccess) =>
        describePermissionTestRecordAccess({ ...recordAccess, findWorkspace }),
    });
  });
