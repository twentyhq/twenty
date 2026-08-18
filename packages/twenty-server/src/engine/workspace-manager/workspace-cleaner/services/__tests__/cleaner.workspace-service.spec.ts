import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

describe('CleanerWorkspaceService workspace deletion recovery', () => {
  const workspaceService = {
    deleteWorkspace: jest.fn(),
    enqueueWorkspaceDeletionApplicationUninstall: jest.fn(),
  };

  const createService = () => {
    const service = Object.create(CleanerWorkspaceService.prototype);

    Object.assign(service, {
      workspaceService,
      logger: { log: jest.fn() },
    });

    return service as CleanerWorkspaceService;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('recovers pending uninstall work instead of hard deleting the workspace', async () => {
    const workspace = {
      id: 'workspace-id',
      deletedAt: new Date('2026-08-01T10:00:00.000Z'),
      applicationUninstallHooksCompletedAt: null,
    };

    await createService().destroySoftDeletedWorkspace({
      workspace: workspace as never,
      ignoreGracePeriod: true,
    });

    expect(
      workspaceService.enqueueWorkspaceDeletionApplicationUninstall,
    ).toHaveBeenCalledWith('workspace-id');
    expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
  });
});
