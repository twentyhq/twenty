import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { BarChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/bar-chart-data.dto';
import { BarChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UseFilters(ChartDataGraphqlApiExceptionFilter)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
@UsePipes(ResolverValidationPipe)
export class BarChartDataResolver {
  constructor(private readonly barChartDataService: BarChartDataService) {}

  @Query(() => BarChartDataDTO)
  async barChartData(
    @Args('input') input: BarChartDataInput,
    @Context() context: I18nContext,
  ): Promise<BarChartDataDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.barChartDataService.getBarChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      dashboardFilterValues: input.dashboardFilterValues,
      viewerTimeZone: input.viewerTimeZone,
      workspaceId: authContext.workspace.id,
      authContext,
      locale: context.req.locale,
    });
  }
}
