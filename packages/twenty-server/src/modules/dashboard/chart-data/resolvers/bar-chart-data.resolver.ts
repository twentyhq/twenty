import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { BarChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input';
import { BarChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/bar-chart-data-output.dto';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';

@MetadataResolver()
@UseFilters(ChartDataGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class BarChartDataResolver {
  constructor(private readonly barChartDataService: BarChartDataService) {}

  @Query(() => BarChartDataOutputDTO)
  @UseGuards(NoPermissionGuard)
  async barChartData(
    @Args('input') input: BarChartDataInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<BarChartDataOutputDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.barChartDataService.getBarChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: workspace.id,
      authContext,
    });
  }
}
