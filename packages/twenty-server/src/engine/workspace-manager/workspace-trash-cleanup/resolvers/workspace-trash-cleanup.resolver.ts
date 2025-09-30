import { Mutation, Resolver } from '@nestjs/graphql';

import { WorkspaceTrashCleanupService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-cleanup.service';

@Resolver()
export class WorkspaceTrashCleanupResolver {
  constructor(
    private readonly workspaceTrashCleanupService: WorkspaceTrashCleanupService,
  ) {}

  @Mutation(() => String)
  async triggerWorkspaceTrashCleanup(): Promise<string> {
    await this.workspaceTrashCleanupService.cleanupWorkspaceTrash();

    return 'Workspace trash cleanup triggered successfully';
  }
}
