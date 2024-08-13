import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { CreateServerlessFunctionFromFileInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function-from-file.input';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { DeleteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/delete-serverless-function.input';
import { ExecuteServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/execute-serverless-function.input';
import { ServerlessFunctionExecutionResultDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { ServerlessFunctionInterceptor } from 'src/engine/metadata-modules/serverless-function/serverless-function.interceptor';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { serverlessFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-graphql-api-exception-handler.utils';

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
        key: FeatureFlagKey.IsFunctionSettingsEnabled,
        value: true,
      });

    if (!isFunctionSettingsEnabled) {
      throw new ServerlessFunctionException(
        `IS_FUNCTION_SETTINGS_ENABLED feature flag is not set to true for this workspace`,
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }
  }

  @Mutation(() => ServerlessFunctionDTO)
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

  @UseInterceptors(ServerlessFunctionInterceptor)
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

  @UseInterceptors(ServerlessFunctionInterceptor)
  @Mutation(() => ServerlessFunctionDTO)
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

  @UseInterceptors(ServerlessFunctionInterceptor)
  @Mutation(() => ServerlessFunctionDTO)
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

  @Mutation(() => ServerlessFunctionExecutionResultDTO)
  async executeOneServerlessFunction(
    @Args() executeServerlessFunctionInput: ExecuteServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.checkFeatureFlag(workspaceId);
      const { id, payload } = executeServerlessFunctionInput;

      return await this.serverlessFunctionService.executeOne(
        id,
        workspaceId,
        payload,
      );
    } catch (error) {
      serverlessFunctionGraphQLApiExceptionHandler(error);
    }
  }
}
