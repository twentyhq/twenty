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
import { CreateDefaultLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-default-logic-function.input';
import { ExecuteOneLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/execute-logic-function.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionIdInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-id.input';
import { LogicFunctionLogsDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.dto';
import { LogicFunctionLogsInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-logs.input';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { UpdateLogicFunctionSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-source.input';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
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
  ) {}

  @Query(() => LogicFunctionDTO)
  async findOneLogicFunction(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      return await this.logicFunctionService.findOne({ id, workspaceId });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [LogicFunctionDTO])
  async findManyLogicFunctions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO[]> {
    try {
      return await this.logicFunctionService.findMany({ workspaceId });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  async getAvailablePackages(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.logicFunctionService.getAvailablePackages({
        id,
        workspaceId,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async deleteOneLogicFunction(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      return await this.logicFunctionService.deleteOne({ id, workspaceId });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => LogicFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async createDefaultLogicFunction(
    @Args('input') input: CreateDefaultLogicFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionDTO> {
    try {
      return await this.logicFunctionService.createDefault({
        input,
        workspaceId,
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
      return await this.logicFunctionService.executeOne({
        id,
        payload,
        forceRebuild,
        workspaceId,
      });
    } catch (error) {
      return logicFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson, { nullable: true })
  async getLogicFunctionSourceCode(
    @Args('input') { id }: LogicFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.logicFunctionService.getSourceCode({
        id,
        workspaceId,
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
      await this.logicFunctionService.updateLogicFunctionSource({
        id,
        code,
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
