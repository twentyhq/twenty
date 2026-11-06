import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

// a run keeps the steps of its version as they were stored, so their schemas are computed again for the run view
@Injectable()
@WorkspaceQueryHook({
  key: `workflowRun.findOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkflowRunFindOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: WorkflowRunWorkspaceEntity[],
  ): Promise<void> {
    for (const workflowRun of payload) {
      const state = workflowRun.state;

      // state is absent when the query did not select it
      if (!isDefined(state?.flow)) {
        continue;
      }

      const { trigger, steps } =
        await this.workflowSchemaWorkspaceService.enrichWorkflowVersionContentOutputSchemas(
          {
            trigger: state.flow.trigger,
            steps: state.flow.steps,
            workspaceId: authContext.workspace.id,
          },
        );

      if (!isDefined(trigger) || !isDefined(steps)) {
        continue;
      }

      workflowRun.state = { ...state, flow: { trigger, steps } };
    }
  }
}
