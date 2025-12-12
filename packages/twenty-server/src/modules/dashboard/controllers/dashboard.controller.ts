import { Controller, Param, Post, UseFilters, UseGuards } from '@nestjs/common';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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
  ): Promise<DuplicatedDashboardDTO> {
    return this.dashboardDuplicationService.duplicateDashboard(
      id,
      workspace.id,
    );
  }
}
