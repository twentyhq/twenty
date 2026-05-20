import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';
import { createGetWorkflowRunTool } from 'src/modules/workflow/workflow-run-tools/get-workflow-run.tool';
import { createListWorkflowRunsTool } from 'src/modules/workflow/workflow-run-tools/list-workflow-runs.tool';
import { createRunWorkflowVersionTool } from 'src/modules/workflow/workflow-run-tools/run-workflow-version.tool';
import { createStopWorkflowRunTool } from 'src/modules/workflow/workflow-run-tools/stop-workflow-run.tool';
import { type WorkflowRunToolDependencies } from 'src/modules/workflow/workflow-run-tools/types/workflow-run-tool-dependencies.type';

@Injectable()
export class WorkflowRunToolWorkspaceService {
  private readonly deps: WorkflowRunToolDependencies;

  constructor(
    globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {
    this.deps = {
      globalWorkspaceOrmManager,
      workflowTriggerWorkspaceService,
    };
  }

  generateWorkflowRunTools(
    workspaceId: string,
    actorContext?: ActorMetadata,
  ): ToolSet {
    const context = { workspaceId, actorContext };

    const listWorkflowRuns = createListWorkflowRunsTool(this.deps, context);
    const getWorkflowRun = createGetWorkflowRunTool(this.deps, context);
    const runWorkflowVersion = createRunWorkflowVersionTool(this.deps, context);
    const stopWorkflowRun = createStopWorkflowRunTool(this.deps, context);

    return {
      [listWorkflowRuns.name]: listWorkflowRuns,
      [getWorkflowRun.name]: getWorkflowRun,
      [runWorkflowVersion.name]: runWorkflowVersion,
      [stopWorkflowRun.name]: stopWorkflowRun,
    };
  }
}
