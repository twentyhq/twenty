import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { LineChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/line-chart-data.input';
import { LineChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-data-output.dto';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';

@Resolver()
@UseFilters(ChartDataGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class LineChartDataResolver {
  constructor(private readonly lineChartDataService: LineChartDataService) {}

  @Query(() => LineChartDataOutputDTO)
  @UseGuards(NoPermissionGuard)
  async lineChartData(
    @Args('input') input: LineChartDataInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<LineChartDataOutputDTO> {
    return this.lineChartDataService.getLineChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: workspace.id,
    });
  }
}
