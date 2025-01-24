import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import graphqlTypeJson from 'graphql-type-json';
import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { ServerlessFunctionIdInput } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-id.input';
import { ExecuteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/execute-serverless-function.input';
import { GetServerlessFunctionSourceCodeInput } from 'src/engine/metadata-modules/serverless-function/dtos/get-serverless-function-source-code.input';
import { PublishServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/publish-serverless-function.input';
import { ServerlessFunctionExecutionResultDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { serverlessFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-graphql-api-exception-handler.utils';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ServerlessFunctionResolver {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async checkFeatureFlag(workspaceId: string) {
    const isWorkflowEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key: FeatureFlagKey.IsWorkflowEnabled,
      value: true,
    });

    if (!isWorkflowEnabled) {
      throw new ServerlessFunctionException(
        `IS_WORKFLOW_ENABLED feature flag is not set to true for this workspace`,
        ServerlessFunctionExceptionCode.FEATURE_FLAG_INVALID,
      );
    }
  }

  @Query(() => ServerlessFunctionDTO)
  async findOneServerlessFunction(
    @Args('input') { id }: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return (
        await this.serverlessFunctionService.findManyServerlessFunctions({
          id,
        })
      )?.[0];
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [ServerlessFunctionDTO])
  async findManyServerlessFunctions(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.findManyServerlessFunctions({
        workspaceId,
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson)
  async getAvailablePackages(
    @Args('input') { id }: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.getAvailablePackages(id);
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => graphqlTypeJson, { nullable: true })
  async getServerlessFunctionSourceCode(
    @Args('input') input: GetServerlessFunctionSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

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
  async deleteOneServerlessFunction(
    @Args('input') input: ServerlessFunctionIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.deleteOneServerlessFunction({
        id: input.id,
        workspaceId,
      });
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  async updateOneServerlessFunction(
    @Args('input')
    input: UpdateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.updateOneServerlessFunction(
        input,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
  async createOneServerlessFunction(
    @Args('input')
    input: CreateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.createOneServerlessFunction(
        input,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionExecutionResultDTO)
  async executeOneServerlessFunction(
    @Args('input') input: ExecuteServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);
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
  async publishServerlessFunction(
    @Args('input') input: PublishServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);
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
