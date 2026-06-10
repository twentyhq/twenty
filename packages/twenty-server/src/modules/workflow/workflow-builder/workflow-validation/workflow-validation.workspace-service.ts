import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  validateWorkflowStructure,
  type RecordCrudActionInput,
  type WorkflowValidationIssue,
  type WorkflowValidationResult,
} from 'twenty-shared/workflow';

import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const RECORD_CRUD_ACTION_TYPES = new Set<WorkflowActionType>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.DELETE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
  WorkflowActionType.FIND_RECORDS,
]);

@Injectable()
export class WorkflowValidationWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  async validateWorkflowVersion({
    workspaceId,
    workflowVersionId,
  }: {
    workspaceId: string;
    workflowVersionId: string;
  }): Promise<WorkflowValidationResult> {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId,
      });

    return this.validateWorkflowDefinition({
      workspaceId,
      workflowVersionId,
      trigger: workflowVersion.trigger,
      steps: workflowVersion.steps,
    });
  }

  async validateWorkflowDefinition({
    workspaceId,
    workflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    workflowVersionId?: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<WorkflowValidationResult> {
    const { trigger: enrichedTrigger, steps: enrichedSteps } =
      await this.enrichOutputSchemas({
        workspaceId,
        workflowVersionId,
        trigger,
        steps,
      });

    const staticResult = validateWorkflowStructure({
      trigger: enrichedTrigger,
      steps: enrichedSteps,
    });

    const semanticIssues = this.validateStepTypeRequirements({
      steps: enrichedSteps ?? [],
    });

    const metadataIssues = await this.validateWorkspaceMetadata({
      workspaceId,
      steps: enrichedSteps ?? [],
    });

    return mergeValidationResults(staticResult, [
      ...semanticIssues,
      ...metadataIssues,
    ]);
  }

  private async enrichOutputSchemas({
    workspaceId,
    workflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    workflowVersionId?: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<{
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }> {
    const enrichedTrigger = isDefined(trigger)
      ? await this.withComputedOutputSchema({
          step: trigger,
          workspaceId,
          workflowVersionId,
        })
      : trigger;

    const enrichedSteps = isDefined(steps)
      ? await Promise.all(
          steps.map((step) =>
            this.withComputedOutputSchema({
              step,
              workspaceId,
              workflowVersionId,
            }),
          ),
        )
      : steps;

    return { trigger: enrichedTrigger, steps: enrichedSteps };
  }

  private async withComputedOutputSchema<
    TStep extends WorkflowTrigger | WorkflowAction,
  >({
    step,
    workspaceId,
    workflowVersionId,
  }: {
    step: TStep;
    workspaceId: string;
    workflowVersionId?: string;
  }): Promise<TStep> {
    try {
      const computedSchema =
        await this.workflowSchemaWorkspaceService.computeStepOutputSchema({
          step,
          workspaceId,
          workflowVersionId,
        });

      if (
        !isDefined(computedSchema) ||
        Object.keys(computedSchema).length === 0
      ) {
        return step;
      }

      return {
        ...step,
        settings: { ...step.settings, outputSchema: computedSchema },
      };
    } catch {
      return step;
    }
  }

  private validateStepTypeRequirements({
    steps,
  }: {
    steps: WorkflowAction[];
  }): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];

    for (const step of steps) {
      switch (step.type) {
        case WorkflowActionType.AI_AGENT:
          issues.push(...this.validateAiAgentStep(step));
          break;
      }
    }

    return issues;
  }

  private validateAiAgentStep(step: WorkflowAction): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];
    const input = step.settings?.input as
      | { agentId?: string; prompt?: string }
      | undefined;

    if (!input?.agentId) {
      issues.push({
        severity: 'error',
        code: 'AI_AGENT_MISSING_AGENT',
        message: `AI Agent step "${step.name ?? step.id}" has no agent selected.`,
        stepId: step.id,
      });
    }

    const outputSchema = step.settings?.outputSchema;
    const hasOutputSchema =
      isDefined(outputSchema) && Object.keys(outputSchema).length > 0;

    if (!hasOutputSchema) {
      issues.push({
        severity: 'warning',
        code: 'AI_AGENT_MISSING_OUTPUT_VARIABLE',
        message: `AI Agent step "${step.name ?? step.id}" has no output variable defined. Downstream steps won't be able to reference its result.`,
        stepId: step.id,
      });
    }

    return issues;
  }

  private async validateWorkspaceMetadata({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const recordSteps = steps.filter((step) =>
      RECORD_CRUD_ACTION_TYPES.has(step.type),
    );

    if (recordSteps.length === 0) {
      return [];
    }

    const { objectIdByNameSingular } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    const issues: WorkflowValidationIssue[] = [];

    for (const step of recordSteps) {
      const objectName = (step.settings.input as RecordCrudActionInput)
        .objectName;

      if (!isString(objectName)) {
        issues.push({
          severity: 'error',
          code: 'INVALID_STEP_PARAMS',
          message: `Step "${step.name ?? step.id}" has an invalid object name.`,
          stepId: step.id,
        });

        continue;
      }

      if (!isDefined(objectIdByNameSingular[objectName])) {
        issues.push({
          severity: 'error',
          code: 'INVALID_STEP_PARAMS',
          message: `Step "${step.name ?? step.id}" targets object "${objectName}" which does not exist in this workspace.`,
          stepId: step.id,
        });
      }
    }

    return issues;
  }
}

const mergeValidationResults = (
  baseResult: WorkflowValidationResult,
  additionalIssues: WorkflowValidationIssue[],
): WorkflowValidationResult => {
  const errors = [
    ...baseResult.errors,
    ...additionalIssues.filter((issue) => issue.severity === 'error'),
  ];
  const warnings = [
    ...baseResult.warnings,
    ...additionalIssues.filter((issue) => issue.severity === 'warning'),
  ];

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};
