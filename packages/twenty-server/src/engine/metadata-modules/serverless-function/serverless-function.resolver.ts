import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { ExecuteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/execute-serverless-function.input';
import { GetServerlessFunctionSourceCodeInput } from 'src/engine/metadata-modules/serverless-function/dtos/get-serverless-function-source-code.input';
import { PublishServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/publish-serverless-function.input';
import { ServerlessFunctionExecutionResultDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionIdInput } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-id.input';
import { ServerlessFunctionLogsDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-logs.dto';
import { ServerlessFunctionLogsInput } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-logs.input';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { findFlatServerlessFunctionOrThrow } from 'src/engine/metadata-modules/serverless-function/utils/find-flat-serverless-function-or-throw.util';
import { fromFlatServerlessFunctionToServerlessFunctionDto } from 'src/engine/metadata-modules/serverless-function/utils/from-flat-serverless-function-to-serverless-function-dto.util';
import { serverlessFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-graphql-api-exception-handler.utils';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class ServerlessFunctionResolver {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => ServerlessFunctionDTO)
  async findOneServerlessFunction(
    @Args('input') { id }: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ServerlessFunctionDTO> {
    try {
      const { flatServerlessFunctionMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatServerlessFunctionMaps'],
          },
        );

      const flatServerlessFunction = findFlatServerlessFunctionOrThrow({
        id,
        flatServerlessFunctionMaps,
      });

      return fromFlatServerlessFunctionToServerlessFunctionDto({
        flatServerlessFunction,
      });
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [ServerlessFunctionDTO])
  async findManyServerlessFunctions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ServerlessFunctionDTO[]> {
    try {
      const { flatServerlessFunctionMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatServerlessFunctionMaps'],
          },
        );

      return Object.values(flatServerlessFunctionMaps.byId)
        .filter(
          (
            flatServerlessFunction,
          ): flatServerlessFunction is FlatServerlessFunction =>
            isDefined(flatServerlessFunction) &&
            !isDefined(flatServerlessFunction.deletedAt),
        )
        .map((flatServerlessFunction) =>
          fromFlatServerlessFunctionToServerlessFunctionDto({
            flatServerlessFunction,
          }),
        );
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  async getAvailablePackages(@Args('input') { id }: ServerlessFunctionIdInput) {
    try {
      return await this.serverlessFunctionService.getAvailablePackages(id);
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson, { nullable: true })
  async getServerlessFunctionSourceCode(
    @Args('input') input: GetServerlessFunctionSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.serverlessFunctionService.getServerlessFunctionSourceCode(
        workspaceId,
        input.id,
        input.version,
      );
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async deleteOneServerlessFunction(
    @Args('input') input: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ServerlessFunctionDTO> {
    try {
      const flatServerlessFunction =
        await this.serverlessFunctionService.deleteOneServerlessFunction({
          id: input.id,
          workspaceId,
        });

      return fromFlatServerlessFunctionToServerlessFunctionDto({
        flatServerlessFunction,
      });
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async updateOneServerlessFunction(
    @Args('input')
    input: UpdateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ServerlessFunctionDTO> {
    try {
      const flatServerlessFunction =
        await this.serverlessFunctionService.updateOneServerlessFunction(
          input,
          workspaceId,
        );

      return fromFlatServerlessFunctionToServerlessFunctionDto({
        flatServerlessFunction,
      });
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async createOneServerlessFunction(
    @Args('input')
    input: CreateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ServerlessFunctionDTO> {
    try {
      const flatServerlessFunction =
        await this.serverlessFunctionService.createOneServerlessFunction(
          input,
          workspaceId,
        );

      return fromFlatServerlessFunctionToServerlessFunctionDto({
        flatServerlessFunction,
      });
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionExecutionResultDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async executeOneServerlessFunction(
    @Args('input') input: ExecuteServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const { id, payload, version } = input;

      return await this.serverlessFunctionService.executeOneServerlessFunction({
        id,
        workspaceId,
        payload,
        version,
      });
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async publishServerlessFunction(
    @Args('input') input: PublishServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ServerlessFunctionDTO> {
    try {
      const { id } = input;

      const flatServerlessFunction =
        await this.serverlessFunctionService.publishOneServerlessFunctionOrFail(
          id,
          workspaceId,
        );

      return fromFlatServerlessFunctionToServerlessFunctionDto({
        flatServerlessFunction,
      });
    } catch (error) {
      return serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Subscription(() => ServerlessFunctionLogsDTO, {
    filter: (
      payload: { serverlessFunctionLogs: ServerlessFunctionLogsDTO },
      variables: { input: ServerlessFunctionLogsInput },
    ) => {
      const { serverlessFunctionLogs } = payload;
      const {
        id,
        universalIdentifier,
        applicationId,
        applicationUniversalIdentifier,
        name,
      } = serverlessFunctionLogs;
      const {
        id: inputId,
        universalIdentifier: inputUniversalIdentifier,
        name: inputName,
        applicationId: inputApplicationId,
        applicationUniversalIdentifier: inputApplicationUniversalIdentifier,
      } = variables.input;

      return (
        (!isDefined(inputId) || inputId === id) &&
        (!isDefined(inputUniversalIdentifier) ||
          inputUniversalIdentifier === universalIdentifier) &&
        (!isDefined(inputName) || inputName === name) &&
        (!isDefined(inputApplicationId) ||
          inputApplicationId === applicationId) &&
        (!isDefined(inputApplicationUniversalIdentifier) ||
          inputApplicationUniversalIdentifier ===
            applicationUniversalIdentifier)
      );
    },
  })
  serverlessFunctionLogs(
    @Args('input') _: ServerlessFunctionLogsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.SERVERLESS_FUNCTION_LOGS_CHANNEL,
      workspaceId: workspace.id,
    });
  }
}
