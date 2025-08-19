import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { TestHttpResponseDto } from 'src/engine/metadata-modules/workflow-version-step-http-request-test/dtos/test-step-http-response.dto';
import { WorkflowHttpRequestActionInputDto } from 'src/engine/metadata-modules/workflow-version-step-http-request-test/dtos/workflow-http-request-action-input.dto';

import { WorkflowVersionStepHttpRequestTestService } from './workflow-version-step-http-request-test.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class WorkflowVersionStepHttpRequestTestResolver {
  constructor(
    private readonly workflowVersionStepHttpRequestTestService: WorkflowVersionStepHttpRequestTestService,
  ) {}

  @Mutation(() => TestHttpResponseDto)
  async testHttpRequest(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input') inputDto: WorkflowHttpRequestActionInputDto,
  ) {
    const response =
      await this.workflowVersionStepHttpRequestTestService.testHttpRequest({
        workspaceId,
        input: inputDto.input,
      });

    return response;
  }
}
