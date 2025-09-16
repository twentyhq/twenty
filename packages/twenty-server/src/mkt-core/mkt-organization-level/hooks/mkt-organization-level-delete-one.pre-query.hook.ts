import { BadRequestException, Logger } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';

@WorkspaceQueryHook('mktOrganizationLevel.deleteOne')
export class MktOrganizationLevelDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(
    MktOrganizationLevelDeleteOnePreQueryHook.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const recordId = payload?.id;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!recordId || !workspaceId) {
      throw new BadRequestException('Invalid record ID or workspace context');
    }

    this.logger.log(
      `Validating organization level deletion for ID: ${recordId}`,
    );

    // Get current record
    const recordToDelete = await this.getCurrentRecord(recordId, workspaceId);

    // 1. Check if level has child levels
    await this.validateNoChildLevels(recordId, workspaceId);

    // 2. Check if level is assigned to any workspace members
    await this.validateNoAssignedMembers(recordId, workspaceId);

    // 3. Check if this is the last active level
    await this.validateNotLastActiveLevel(recordToDelete, workspaceId);

    this.logger.log(
      'Organization level deletion validation completed successfully',
    );

    return payload;
  }

  private async getRepository(workspaceId: string) {
    return await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrganizationLevelWorkspaceEntity>(
      workspaceId,
      'mktOrganizationLevel',
      { shouldBypassPermissionChecks: true },
    );
  }

  private async getCurrentRecord(
    recordId: string,
    workspaceId: string,
  ): Promise<MktOrganizationLevelWorkspaceEntity> {
    const repository = await this.getRepository(workspaceId);

    const record = await repository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new BadRequestException(
        `Organization level with ID '${recordId}' not found`,
      );
    }

    return record;
  }

  private async validateNoChildLevels(
    recordId: string,
    workspaceId: string,
  ): Promise<void> {
    const repository = await this.getRepository(workspaceId);

    const childLevels = await repository.find({
      where: { parentLevelId: recordId },
    });

    if (childLevels.length > 0) {
      const childNames = childLevels.map((child) => child.levelName).join(', ');

      throw new BadRequestException(
        `Cannot delete organization level: it has ${childLevels.length} child level(s): ${childNames}. ` +
          'Please delete or reassign child levels first.',
      );
    }
  }

  private async validateNoAssignedMembers(
    recordId: string,
    workspaceId: string,
  ): Promise<void> {
    try {
      // Check if WorkspaceMember entity exists and has organizationLevel field
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      // Try to find members assigned to this organization level
      const assignedMembers = await workspaceMemberRepository.find({
        where: { organizationLevelId: recordId },
      });

      if (assignedMembers.length > 0) {
        throw new BadRequestException(
          `Cannot delete organization level: it is assigned to ${assignedMembers.length} workspace member(s). ` +
            'Please reassign these members to other levels first.',
        );
      }
    } catch (error) {
      // If WorkspaceMember doesn't have organizationLevel field yet, log but don't fail
      this.logger.warn(
        'Could not check workspace member assignments:',
        error.message,
      );
      // Continue with deletion - this validation can be added later when the relationship is implemented
    }
  }

  private async validateNotLastActiveLevel(
    recordToDelete: MktOrganizationLevelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    if (!recordToDelete.isActive) {
      return; // If already inactive, deletion is allowed
    }

    const repository = await this.getRepository(workspaceId);

    const activeLevels = await repository.find({
      where: { isActive: true },
    });

    if (activeLevels.length <= 1) {
      throw new BadRequestException(
        'Cannot delete the last active organization level. ' +
          'Please create another active level before deleting this one.',
      );
    }
  }
}
