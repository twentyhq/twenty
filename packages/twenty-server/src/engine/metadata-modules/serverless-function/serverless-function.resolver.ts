import { Inject, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import graphqlTypeJson from 'graphql-type-json';
import { Repository } from 'typeorm';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { ExecuteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/execute-serverless-function.input';
import { GetServerlessFunctionSourceCodeInput } from 'src/engine/metadata-modules/serverless-function/dtos/get-serverless-function-source-code.input';
import { PublishServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/publish-serverless-function.input';
import { ServerlessFunctionExecutionResultDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionIdInput } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-id.input';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { serverlessFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-graphql-api-exception-handler.utils';
import { ServerlessFunctionLogsDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-logs.dto';
import { ServerlessFunctionLogsInput } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-logs.input';
import { SERVERLESS_FUNCTION_LOGS_TRIGGER } from 'src/engine/metadata-modules/serverless-function/constants/serverless-function-logs-trigger';

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
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    @Inject('PUB_SUB')
    private readonly pubSub: RedisPubSub,
  ) {}

  @Query(() => ServerlessFunctionDTO)
  async findOneServerlessFunction(
    @Args('input') { id }: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
        relations: ['cronTriggers', 'databaseEventTriggers', 'routeTriggers'],
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [ServerlessFunctionDTO])
  async findManyServerlessFunctions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return this.serverlessFunctionRepository.find({
        where: { workspaceId },
        relations: ['cronTriggers', 'databaseEventTriggers', 'routeTriggers'],
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  async getAvailablePackages(@Args('input') { id }: ServerlessFunctionIdInput) {
    try {
      return await this.serverlessFunctionService.getAvailablePackages(id);
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
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
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async deleteOneServerlessFunction(
    @Args('input') input: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.serverlessFunctionService.deleteOneServerlessFunction({
        id: input.id,
        workspaceId,
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async updateOneServerlessFunction(
    @Args('input')
    input: UpdateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.serverlessFunctionService.updateOneServerlessFunction(
        input,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async createOneServerlessFunction(
    @Args('input')
    input: CreateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.serverlessFunctionService.createOneServerlessFunction(
        input,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
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
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async publishServerlessFunction(
    @Args('input') input: PublishServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const { id } = input;

      return await this.serverlessFunctionService.publishOneServerlessFunctionOrFail(
        id,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
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
  serverlessFunctionLogs(@Args('input') _: ServerlessFunctionLogsInput) {
    return this.pubSub.asyncIterator(SERVERLESS_FUNCTION_LOGS_TRIGGER);
  }
}
