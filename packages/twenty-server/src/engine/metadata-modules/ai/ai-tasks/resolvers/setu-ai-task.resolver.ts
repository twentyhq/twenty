import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { type SetuAiTaskProjection } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AiActiveTaskDTO } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/ai-active-task.dto';
import { AiTaskStateDTO } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/ai-task-state.dto';
import { AiTaskStatesDTO } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/ai-task-states.dto';
import { AiTaskStatesInput } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/ai-task-states.input';
import { AnswerAiTaskInputInput } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/answer-ai-task-input.input';
import { CancelAiTaskInput } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/cancel-ai-task.input';
import { RetryAiTaskStepInput } from 'src/engine/metadata-modules/ai/ai-tasks/dtos/retry-ai-task-step.input';
import { SetuAiTaskGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/ai-tasks/setu-ai-task-graphql-api-exception.interceptor';
import { SetuAiTaskService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task.service';

// Task answers, retries and cancellation are authenticated UI operations
// only. Workspace and person come from authentication; ids are references,
// never proof of access. Only the person who started a task can act on it.
@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: false,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  FeatureFlagGuard,
)
@UseInterceptors(SetuAiTaskGraphqlApiExceptionInterceptor)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class SetuAiTaskResolver {
  constructor(private readonly setuAiTaskService: SetuAiTaskService) {}

  @Query(() => AiTaskStatesDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async aiTaskStates(
    @Args('input') { taskIds }: AiTaskStatesInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiTaskStatesDTO> {
    const results = await this.setuAiTaskService.findProjections({
      owner: { workspaceId: workspace.id, userWorkspaceId },
      taskIds,
    });

    return {
      tasks: results.map((result) => ({
        requestedId: result.requestedId,
        isAvailable: result.status === 'available',
        task: result.status === 'available' ? result.task : null,
      })),
    };
  }

  @Query(() => [AiActiveTaskDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async aiActiveTasks(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiActiveTaskDTO[]> {
    return this.setuAiTaskService.findActiveProjections({
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => AiTaskStateDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async answerAiTaskInput(
    @Args('input') input: AnswerAiTaskInputInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiTaskStateDTO> {
    return this.toState(
      input.taskId,
      await this.setuAiTaskService.answerInput({
        ...input,
        owner: { workspaceId: workspace.id, userWorkspaceId },
      }),
    );
  }

  @Mutation(() => AiTaskStateDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async cancelAiTask(
    @Args('input') input: CancelAiTaskInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiTaskStateDTO> {
    return this.toState(
      input.taskId,
      await this.setuAiTaskService.cancel({
        ...input,
        owner: { workspaceId: workspace.id, userWorkspaceId },
      }),
    );
  }

  @Mutation(() => AiTaskStateDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async retryAiTaskStep(
    @Args('input') input: RetryAiTaskStepInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiTaskStateDTO> {
    return this.toState(
      input.taskId,
      await this.setuAiTaskService.retryStep({
        ...input,
        owner: { workspaceId: workspace.id, userWorkspaceId },
      }),
    );
  }

  private toState(
    requestedId: string,
    task: SetuAiTaskProjection,
  ): AiTaskStateDTO {
    return { requestedId, isAvailable: true, task };
  }
}
