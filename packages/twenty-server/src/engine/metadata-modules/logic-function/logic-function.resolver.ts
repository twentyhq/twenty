import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { LogicFunctionSourceBuilderService } from 'src/engine/core-modules/logic-function/logic-function-source-builder/logic-function-source-builder.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import { ExecuteOneLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/execute-logic-function.input';
import { GetLogicFunctionSourceCodeInput } from 'src/engine/metadata-modules/logic-function/dtos/get-logic-function-source-code.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionIdInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-id.input';
import { LogicFunctionLogsDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.dto';
import { LogicFunctionLogsInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.input';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { UpdateLogicFunctionSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-source.input';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
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
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionSourceBuilderService: LogicFunctionSourceBuilderService,
    private readonly applicationService: ApplicationService,
    private readonly subscriptionService: SubscriptionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async getLogicFunctionContext({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    const [{ flatLogicFunctionMaps }, { workspaceCustomFlatApplication }] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        }),
        this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        ),
      ]);

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    return {
      flatLogicFunction,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    };
  }

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

      return Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
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
      return await this.logicFunctionExecutorService.getAvailablePackages(id);
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
      const flatLogicFunction = await this.logicFunctionService.destroyOne({
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
  async createOneLogicFunction(
    @Args('input')
    input: CreateLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const flatLogicFunction = await this.logicFunctionService.createOne({
        input,
        workspaceId,
      });

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
    @Args('input') { id, payload, forceRebuild }: ExecuteOneLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionExecutionResultDTO> {
    try {
      if (forceRebuild) {
        const { flatLogicFunction, applicationUniversalIdentifier } =
          await this.getLogicFunctionContext({ id, workspaceId });

        const { checksum } =
          await this.logicFunctionSourceBuilderService.buildFromSource({
            workspaceId,
            applicationUniversalIdentifier,
            sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
            builtHandlerPath: flatLogicFunction.builtHandlerPath,
          });

        await this.logicFunctionService.updateChecksum({
          id,
          checksum,
          workspaceId,
        });
      }

      const result =
        await this.logicFunctionExecutorService.executeOneLogicFunction({
          id,
          workspaceId,
          payload,
        });

      return {
        data: result.data as LogicFunctionExecutionResultDTO['data'],
        logs: result.logs,
        duration: result.duration,
        status: result.status,
        error: result.error
          ? {
              errorType: result.error.errorType,
              errorMessage: result.error.errorMessage,
              stackTrace: Array.isArray(result.error.stackTrace)
                ? result.error.stackTrace.join('\n')
                : result.error.stackTrace,
            }
          : undefined,
      };
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson, { nullable: true })
  async getLogicFunctionSourceCode(
    @Args('input') { id }: GetLogicFunctionSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const { flatLogicFunction, applicationUniversalIdentifier } =
        await this.getLogicFunctionContext({ id, workspaceId });

      return this.logicFunctionSourceBuilderService.getSourceCode({
        workspaceId,
        applicationUniversalIdentifier,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async updateLogicFunctionSource(
    @Args('input') { id, code }: UpdateLogicFunctionSourceInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    try {
      const { flatLogicFunction, applicationUniversalIdentifier } =
        await this.getLogicFunctionContext({ id, workspaceId });

      await this.logicFunctionSourceBuilderService.updateSourceFiles({
        workspaceId,
        applicationUniversalIdentifier,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        code,
      });

      return true;
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
