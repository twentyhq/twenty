import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';
import { PieChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/pie-chart-data.dto';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

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
export class PieChartDataResolver {
  constructor(private readonly pieChartDataService: PieChartDataService) {}

  @Query(() => PieChartDataDTO)
  @UseGuards(NoPermissionGuard)
  async pieChartData(
    @Args('input') input: PieChartDataInput,
  ): Promise<PieChartDataDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.pieChartDataService.getPieChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: authContext.workspace.id,
      authContext,
    });
  }
}
