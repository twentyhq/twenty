import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { LineChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/line-chart-data.input';
import { LineChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/line-chart-data.dto';
import { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';

@MetadataResolver()
@UseGuards(
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
)
@UsePipes(ResolverValidationPipe)
export class LineChartDataResolver {
  constructor(private readonly lineChartDataService: LineChartDataService) {}

  @Query(() => LineChartDataDTO)
  @UseGuards(NoPermissionGuard)
  async lineChartData(
    @Args('input') input: LineChartDataInput,
  ): Promise<LineChartDataDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.lineChartDataService.getLineChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: authContext.workspace.id,
      authContext,
    });
  }
}
