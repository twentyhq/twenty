import { Controller, Param, Post, UseGuards } from '@nestjs/common';

import { ApiPath } from 'twenty-shared/types';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';

@Controller(`${ApiPath.Rest}/dashboards`)
@UseGuards(
  JwtAuthGuard,
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  CustomPermissionGuard,
)
export class DashboardController {
  constructor(
    private readonly dashboardDuplicationService: DashboardDuplicationService,
  ) {}

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string): Promise<DuplicatedDashboardDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.dashboardDuplicationService.duplicateDashboard(id, authContext);
  }
}
