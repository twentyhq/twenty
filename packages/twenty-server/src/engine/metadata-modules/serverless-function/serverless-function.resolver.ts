import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

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

@UseGuards(JwtAuthGuard)
@Resolver()
export class ServerlessFunctionResolver {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  @Mutation(() => ServerlessFunctionDto)
  async createOneServerlessFunction(
    @Args('input')
    input: CreateServerlessFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
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
