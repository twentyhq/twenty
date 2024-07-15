import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { FunctionMetadataService } from 'src/engine/metadata-modules/function-metadata/function-metadata.service';
import { ExecuteFunctionInput } from 'src/engine/metadata-modules/function-metadata/dtos/execute-function.input';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FunctionMetadataDTO } from 'src/engine/metadata-modules/function-metadata/dtos/function-metadata.dto';
import { FunctionExecutionResultDTO } from 'src/engine/metadata-modules/function-metadata/dtos/function-execution-result.dto';
import { functionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/function-metadata/utils/function-graphql-api-exception-handler.utils';

@UseGuards(JwtAuthGuard)
@Resolver()
export class FunctionMetadataResolver {
  constructor(
    private readonly functionMetadataService: FunctionMetadataService,
  ) {}

  @Mutation(() => FunctionMetadataDTO)
  async createOneFunction(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('name', { type: () => String }) name: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.functionMetadataService.createOne(
        name,
        workspaceId,
        file,
      );
    } catch (error) {
      functionGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => FunctionExecutionResultDTO)
  async executeOneFunction(
    @Args() executeFunctionInput: ExecuteFunctionInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      const { name, payload } = executeFunctionInput;

      return {
        result: await this.functionMetadataService.executeOne(
          name,
          workspaceId,
          payload,
        ),
      };
    } catch (error) {
      functionGraphQLApiExceptionHandler(error);
    }
  }
}
