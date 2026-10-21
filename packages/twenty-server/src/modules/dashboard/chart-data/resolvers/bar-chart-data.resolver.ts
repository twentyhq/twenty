import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { BarChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/bar-chart-data.dto';
import { BarChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';

@MetadataResolver()
@UseFilters(ChartDataGraphqlApiExceptionFilter)
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
export class BarChartDataResolver {
  constructor(private readonly barChartDataService: BarChartDataService) {}

  @Query(() => BarChartDataDTO)
  @UseGuards(NoPermissionGuard)
  async barChartData(
    @Args('input') input: BarChartDataInput,
    @Context() context: I18nContext,
  ): Promise<BarChartDataDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.barChartDataService.getBarChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: authContext.workspace.id,
      authContext,
      locale: context.req.locale,
    });
  }
}
