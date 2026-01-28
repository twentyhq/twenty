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
import { CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import { ExecuteLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/execute-logic-function.input';
import { GetLogicFunctionSourceCodeInput } from 'src/engine/metadata-modules/logic-function/dtos/get-logic-function-source-code.input';
import { PublishLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/publish-logic-function.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionIdInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-id.input';
import { LogicFunctionLogsDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.dto';
import { LogicFunctionLogsInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.input';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { UpdateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function.input';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/logic-function.service';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromFlatLogicFunctionToLogicFunctionDto } from 'src/engine/metadata-modules/logic-function/utils/from-flat-logic-function-to-logic-function-dto.util';
import { logicFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/logic-function/utils/logic-function-graphql-api-exception-handler.utils';
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
export class LogicFunctionResolver {
  constructor(
    private readonly logicFunctionService: LogicFunctionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => LogicFunctionDTO)
  async findOneLogicFunction(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const { flatLogicFunctionMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatLogicFunctionMaps'],
          },
        );

      const flatLogicFunction = findFlatLogicFunctionOrThrow({
        id,
        flatLogicFunctionMaps,
      });

      return fromFlatLogicFunctionToLogicFunctionDto({
        flatLogicFunction,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [LogicFunctionDTO])
  async findManyLogicFunctions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO[]> {
    try {
      const { flatLogicFunctionMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatLogicFunctionMaps'],
          },
        );

      return Object.values(flatLogicFunctionMaps.byId)
        .filter(
          (flatLogicFunction): flatLogicFunction is FlatLogicFunction =>
            isDefined(flatLogicFunction) &&
            !isDefined(flatLogicFunction.deletedAt),
        )
        .map((flatLogicFunction) =>
          fromFlatLogicFunctionToLogicFunctionDto({
            flatLogicFunction,
          }),
        );
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  async getAvailablePackages(@Args('input') { id }: LogicFunctionIdInput) {
    try {
      return await this.logicFunctionService.getAvailablePackages(id);
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson, { nullable: true })
  async getLogicFunctionSourceCode(
    @Args('input') input: GetLogicFunctionSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.logicFunctionService.getLogicFunctionSourceCode(
        workspaceId,
        input.id,
        input.version,
      );
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async deleteOneLogicFunction(
    @Args('input') input: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const flatLogicFunction =
        await this.logicFunctionService.deleteOneLogicFunction({
          id: input.id,
          workspaceId,
        });

      return fromFlatLogicFunctionToLogicFunctionDto({
        flatLogicFunction,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async updateOneLogicFunction(
    @Args('input')
    input: UpdateLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const flatLogicFunction =
        await this.logicFunctionService.updateOneLogicFunction(
          input,
          workspaceId,
        );

      return fromFlatLogicFunctionToLogicFunctionDto({
        flatLogicFunction,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async createOneLogicFunction(
    @Args('input')
    input: CreateLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const flatLogicFunction =
        await this.logicFunctionService.createOneLogicFunction(
          input,
          workspaceId,
        );

      return fromFlatLogicFunctionToLogicFunctionDto({
        flatLogicFunction,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionExecutionResultDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async executeOneLogicFunction(
    @Args('input') input: ExecuteLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const { id, payload, version } = input;

      return await this.logicFunctionService.executeOneLogicFunction({
        id,
        workspaceId,
        payload,
        version,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async publishLogicFunction(
    @Args('input') input: PublishLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const { id } = input;

      const flatLogicFunction =
        await this.logicFunctionService.publishOneLogicFunctionOrFail(
          id,
          workspaceId,
        );

      return fromFlatLogicFunctionToLogicFunctionDto({
        flatLogicFunction,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Subscription(() => LogicFunctionLogsDTO, {
    filter: (
      payload: { logicFunctionLogs: LogicFunctionLogsDTO },
      variables: { input: LogicFunctionLogsInput },
    ) => {
      const { logicFunctionLogs } = payload;
      const {
        id,
        universalIdentifier,
        applicationId,
        applicationUniversalIdentifier,
        name,
      } = logicFunctionLogs;
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
  logicFunctionLogs(
    @Args('input') _: LogicFunctionLogsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId: workspace.id,
    });
  }
}
