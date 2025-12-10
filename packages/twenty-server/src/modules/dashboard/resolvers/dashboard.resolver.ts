import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { DashboardDTO } from 'src/modules/dashboard/dtos/dashboard.dto';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardGraphqlApiExceptionFilter } from 'src/modules/dashboard/utils/dashboard-graphql-api-exception.filter';

@Resolver()
@UseFilters(
  DashboardGraphqlApiExceptionFilter,
  PageLayoutGraphqlApiExceptionFilter,
)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class DashboardResolver {
  constructor(
    private readonly dashboardDuplicationService: DashboardDuplicationService,
  ) {}

  @Mutation(() => DashboardDTO)
  @UseGuards(NoPermissionGuard)
  async duplicateDashboard(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DashboardDTO> {
    return this.dashboardDuplicationService.duplicateDashboard(
      id,
      workspace.id,
    );
  }
}
