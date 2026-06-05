import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceAiStatsDTO } from 'src/engine/metadata-modules/ai/ai-workspace-stats/dtos/workspace-ai-stats.dto';
import { AiWorkspaceStatsService } from 'src/engine/metadata-modules/ai/ai-workspace-stats/services/ai-workspace-stats.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS),
)
@MetadataResolver()
export class AiWorkspaceStatsResolver {
  constructor(
    private readonly aiWorkspaceStatsService: AiWorkspaceStatsService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Query(() => WorkspaceAiStatsDTO)
  async findWorkspaceAiStats(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<WorkspaceAiStatsDTO> {
    // The tool catalog is role-scoped, so resolve the caller's role to count
    // the tools they can actually see.
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId,
    });

    return this.aiWorkspaceStatsService.computeStats(workspaceId, roleId);
  }
}
