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
import { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';
import { PieChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/pie-chart-data-output.dto';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

@MetadataResolver()
@UseFilters(ChartDataGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PieChartDataResolver {
  constructor(private readonly pieChartDataService: PieChartDataService) {}

  @Query(() => PieChartDataOutputDTO)
  @UseGuards(NoPermissionGuard)
  async pieChartData(
    @Args('input') input: PieChartDataInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<PieChartDataOutputDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.pieChartDataService.getPieChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: workspace.id,
      authContext,
    });
  }
}
