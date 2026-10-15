import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Subscription,
} from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { AuthorizeOperation } from 'src/engine/core-modules/authorization/decorators/authorize-operation.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LOGIC_FUNCTION_OPERATIONS } from 'src/engine/metadata-modules/logic-function/constants/logic-function-operations.constant';
import { CreateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function-from-source.input';
import { ExecuteOneLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/execute-logic-function.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionIdInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-id.input';
import { LogicFunctionLogsDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.dto';
import { LogicFunctionLogsInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.input';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { UpdateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-from-source.input';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromFlatLogicFunctionToLogicFunctionDto } from 'src/engine/metadata-modules/logic-function/utils/from-flat-logic-function-to-logic-function-dto.util';
import { logicFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/logic-function/utils/logic-function-graphql-api-exception-handler.utils';
import { APPLICATION_KEEPALIVE_INTERVAL_MS } from 'src/engine/subscriptions/constants/application-keepalive-interval-ms.constant';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';

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
  NoPermissionGuard,
)
@MetadataResolver(() => LogicFunctionDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class LogicFunctionResolver {
  constructor(
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
    private readonly logicFunctionFromSourceHelperService: LogicFunctionFromSourceHelperService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationReachService: ApplicationReachService,
    private readonly subscriptionService: SubscriptionService,
    private readonly eventLogLiveService: EventLogLiveService,
  ) {}

  @Query(() => LogicFunctionDTO)
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.findOne)
  async findOneLogicFunction(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      const flatLogicFunctionMaps =
        await this.applicationReachService.getReachableFlatEntityMaps({
          workspaceId,
          metadataName: 'logicFunction',
          access: 'read',
        });

      const flatLogicFunction = findFlatLogicFunctionOrThrow({
        id,
        flatLogicFunctionMaps,
      });

      return fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [LogicFunctionDTO])
  @AllowSuspendedWorkspace()
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.list)
  async findManyLogicFunctions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO[]> {
    try {
      const flatLogicFunctions =
        await this.logicFunctionFromSourceHelperService.findManyLogicFunctions({
          workspaceId,
        });

      return flatLogicFunctions.map((flatLogicFunction) =>
        fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction }),
      );
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @ResolveField(() => Boolean, { nullable: true })
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.canRunOnDemand)
  async canRunOnDemand(
    @Parent() { id }: Pick<LogicFunctionDTO, 'id'>,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    try {
      return await this.logicFunctionFromSourceHelperService.isLogicFunctionRunnableOnDemand(
        { id, workspaceId },
      );
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.getAvailablePackages)
  async getAvailablePackages(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const { flatLogicFunctionMaps, flatApplicationMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
          },
        );

      const logicFunctionUniversalIdentifier =
        flatLogicFunctionMaps.universalIdentifierById[id];

      if (!logicFunctionUniversalIdentifier) {
        return {};
      }

      const logicFunction =
        flatLogicFunctionMaps.byUniversalIdentifier[
          logicFunctionUniversalIdentifier
        ];

      if (!logicFunction) {
        return {};
      }

      const application = flatApplicationMaps.byId[logicFunction.applicationId];

      return application?.availablePackages ?? {};
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.delete)
  async deleteOneLogicFunction(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      return await this.logicFunctionFromSourceService.deleteOneWithSource({
        id,
        workspaceId,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.create)
  async createOneLogicFunction(
    @Args('input') input: CreateLogicFunctionFromSourceInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      return await this.logicFunctionFromSourceService.createOneFromSource({
        input,
        workspaceId,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionExecutionResultDTO)
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.execute)
  async executeOneLogicFunction(
    @Args('input')
    { id, payload }: ExecuteOneLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<LogicFunctionExecutionResultDTO> {
    try {
      return await this.logicFunctionFromSourceService.executeOneFromSource({
        id,
        payload,
        workspaceId,
        userId,
        userWorkspaceId,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => String, { nullable: true })
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.readSource)
  async getLogicFunctionSourceCode(
    @Args('input')
    { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.logicFunctionFromSourceService.getSourceCode({
        id,
        workspaceId,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => Boolean)
  @AuthorizeOperation(LOGIC_FUNCTION_OPERATIONS.updateSource)
  async updateOneLogicFunction(
    @Args('input')
    updateLogicFunctionFromSourceInput: UpdateLogicFunctionFromSourceInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    try {
      await this.logicFunctionFromSourceService.updateOneFromSource({
        updateLogicFunctionFromSourceInput,
        workspaceId,
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
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async logicFunctionLogs(
    @Args('input') _: LogicFunctionLogsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    // Register CLI presence (refreshed by the heartbeat) so the executor only publishes when watched.
    await this.eventLogLiveService.markWatched(
      workspace.id,
      SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
    );

    const iterator = await this.subscriptionService.subscribe<{
      logicFunctionLogs: LogicFunctionLogsDTO;
    }>({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId: workspace.id,
      mapPayload: (payload) =>
        canCallerReachApplication({
          callingApplication,
          applicationId: payload.logicFunctionLogs.applicationId,
        })
          ? payload
          : undefined,
    });

    return wrapAsyncIteratorWithLifecycle(() => iterator, {
      onHeartbeat: async () => {
        await this.eventLogLiveService.markWatched(
          workspace.id,
          SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
        );

        return true;
      },
      heartbeatIntervalMs: APPLICATION_KEEPALIVE_INTERVAL_MS,
    });
  }
}
