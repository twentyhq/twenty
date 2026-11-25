import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { LineChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/line-chart-data.input';
import { LineChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/line-chart-data.dto';
import { ChartDataGraphqlApiExceptionFilter } from 'src/modules/dashboard/chart-data/filters/chart-data-graphql-api-exception.filter';
import { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';
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
export class LineChartDataResolver {
  constructor(private readonly lineChartDataService: LineChartDataService) {}

  @Query(() => LineChartDataDTO)
  async lineChartData(
    @Args('input') input: LineChartDataInput,
    @Context() context: I18nContext,
  ): Promise<LineChartDataDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.lineChartDataService.getLineChartData({
      objectMetadataId: input.objectMetadataId,
      configuration: input.configuration,
      workspaceId: authContext.workspace.id,
      authContext,
      locale: context.req.locale,
    });
  }
}
