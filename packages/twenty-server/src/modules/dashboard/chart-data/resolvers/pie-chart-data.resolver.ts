import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';
import { PieChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/pie-chart-data-output.dto';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

@Resolver()
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
  ): Promise<PieChartDataOutputDTO> {
    return this.pieChartDataService.getPieChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: workspace.id,
    });
  }
}
