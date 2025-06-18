import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import graphqlTypeJson from 'graphql-type-json';
import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
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

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@Resolver()
export class ServerlessFunctionResolver {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(ServerlessFunctionEntity, 'core')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {}

  @Query(() => ServerlessFunctionDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async findOneServerlessFunction(
    @Args('input') { id }: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.serverlessFunctionRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [ServerlessFunctionDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async findManyServerlessFunctions(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.serverlessFunctionService.findManyServerlessFunctions({
        workspaceId,
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async getAvailablePackages(
    @Args('input') { id }: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: _workspaceId }: Workspace,
  ) {
    try {
      return await this.serverlessFunctionService.getAvailablePackages(id);
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson, { nullable: true })
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async getServerlessFunctionSourceCode(
    @Args('input') input: GetServerlessFunctionSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async deleteOneServerlessFunction(
    @Args('input') input: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async updateOneServerlessFunction(
    @Args('input')
    input: UpdateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async createOneServerlessFunction(
    @Args('input')
    input: CreateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async executeOneServerlessFunction(
    @Args('input') input: ExecuteServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      const { id, payload, version } = input;

      return await this.serverlessFunctionService.executeOneServerlessFunction(
        id,
        workspaceId,
        payload,
        version,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_WORKFLOW_ENABLED)
  async publishServerlessFunction(
    @Args('input') input: PublishServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      const { id } = input;

      return await this.serverlessFunctionService.publishOneServerlessFunction(
        id,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }
}
