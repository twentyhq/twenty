import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ChannelVisibilityRoleWideAccessRevokeService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-role-wide-access-revoke.service';

// TODO(@charlesBochet): delete this command once every existing workspace has run it
@Command({
  name: 'channel-visibility:revoke-role-wide-access',
  description:
    'Revoke the role wide access of user roles to message and calendar objects, to message attachments and to call recordings of calendar events, then schedule their individual roles sync',
})
export class RevokeRoleWideAccessToChannelObjectsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly channelVisibilityRoleWideAccessRevokeService: ChannelVisibilityRoleWideAccessRevokeService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.channelVisibilityRoleWideAccessRevokeService.revokeRoleWideAccess(
      { workspaceId, isDryRun: options.dryRun ?? false },
    );
  }
}
