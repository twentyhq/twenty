import { Controller, Param, Post, UseFilters, UseGuards } from '@nestjs/common';

import { ApiPath } from 'twenty-shared/types';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/permissions/utils/permissions-rest-api-exception.filter';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import { DashboardRestApiExceptionFilter } from 'src/modules/dashboard/filters/dashboard-rest-api-exception.filter';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DASHBOARD_DUPLICATE_ACCESS_POLICY } from 'src/modules/dashboard/constants/dashboard-duplicate-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@Controller(`${ApiPath.Rest}/dashboards`)
@UseGuards(
  JwtAuthGuard,
  AccessPolicyGuard(DASHBOARD_DUPLICATE_ACCESS_POLICY),
  CustomPermissionGuard,
)
@UseFilters(
  DashboardRestApiExceptionFilter,
  PermissionsRestApiExceptionFilter,
  AuthRestApiExceptionFilter,
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
