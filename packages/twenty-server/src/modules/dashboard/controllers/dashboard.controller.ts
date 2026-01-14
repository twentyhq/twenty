import { Controller, Param, Post, UseFilters, UseGuards } from '@nestjs/common';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import { DashboardRestApiExceptionFilter } from 'src/modules/dashboard/filters/dashboard-rest-api-exception.filter';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';

@Controller('rest/dashboards')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(DashboardRestApiExceptionFilter)
export class DashboardController {
  constructor(
    private readonly dashboardDuplicationService: DashboardDuplicationService,
  ) {}

  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DuplicatedDashboardDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.dashboardDuplicationService.duplicateDashboard(id, authContext);
  }
}
