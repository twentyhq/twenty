import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ExecuteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/execute-serverless-function.input';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ServerlessFunctionDto } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { ServerlessFunctionExecutionResultDto } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { serverlessFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-graphql-api-exception-handler.utils';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { CreateServerlessFunctionFromFileInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function-from-file.input';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import { DeleteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/delete-serverless-function.input';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

@UseGuards(JwtAuthGuard)
@Resolver()
export class ServerlessFunctionResolver {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async checkFeatureFlag(workspaceId: string) {
    const isFunctionSettingsEnabled =
      await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsFunctionSettingsEnabled,
        value: true,
      });

    if (!isFunctionSettingsEnabled) {
      throw new ServerlessFunctionException(
        `IS_FUNCTION_SETTINGS_ENABLED feature flag is not set to true for this workspace`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }
  }

  @Mutation(() => ServerlessFunctionDto)
  async deleteOneServerlessFunction(
    @Args('input') input: DeleteServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.deleteOneServerlessFunction(
        input.id,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDto)
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

  @Mutation(() => ServerlessFunctionDto)
  async createOneServerlessFunction(
    @Args('input')
    input: CreateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.createOneServerlessFunction(
        {
          name: input.name,
          description: input.description,
        },
        input.code,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionDto)
  async createOneServerlessFunctionFromFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('input')
    input: CreateServerlessFunctionFromFileInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);

      return await this.serverlessFunctionService.createOneServerlessFunction(
        input,
        file,
        workspaceId,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => ServerlessFunctionExecutionResultDto)
  async executeOneServerlessFunction(
    @Args() executeServerlessFunctionInput: ExecuteServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);
      const { id, payload } = executeServerlessFunctionInput;

      return {
        result: await this.serverlessFunctionService.executeOne(
          id,
          workspaceId,
          payload,
        ),
      };
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }
}
