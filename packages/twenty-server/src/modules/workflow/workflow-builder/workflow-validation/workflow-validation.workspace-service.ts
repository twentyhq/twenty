import { Injectable } from '@nestjs/common';

import {
  isNonEmptyArray,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';
import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
  type WorkflowValidationResult,
} from 'twenty-shared/workflow';

import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { getPickRecordLoadBalanceConfigError } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-pick-record-load-balance-config-error.util';
import {
  type WorkflowAction,
  type WorkflowLogicFunctionAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { hasWorkflowStepLevelOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-workflow-step-level-output-schema.util';
import { buildMissingWorkflowOutputSchemaIssue } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/build-missing-workflow-output-schema-issue.util';
import { validateWorkflowTriggerTypeRequirements } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-trigger-type-requirements.util';
import { validateWorkflowRuntimeOutputStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-runtime-output-step.util';
import { validateWorkflowStepsHaveVariableReferences } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-steps-have-variable-references.util';
import { validateWorkflowIteratorStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-iterator-step.util';
import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import { validateWorkflowLogicFunctionOutputSchemaMismatch } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-logic-function-output-schema-mismatch.util';
import { WORKFLOW_RECORD_CRUD_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/workflow-record-crud-action-types.constant';

const OBJECT_TARGETING_ACTION_TYPES = new Set<WorkflowActionType>([
  ...WORKFLOW_RECORD_CRUD_ACTION_TYPES,
  WorkflowActionType.PICK_RECORD,
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

    const triggerIssues =
      validateWorkflowTriggerTypeRequirements(enrichedTrigger);

    const semanticIssues = await this.validateStepTypeRequirements({
      workspaceId,
      steps: enrichedSteps ?? [],
      trigger: enrichedTrigger,
    });

    const metadataIssues = await this.validateWorkspaceMetadata({
      workspaceId,
      steps: enrichedSteps ?? [],
    });

    const variableReferenceIssues = validateWorkflowStepsHaveVariableReferences(
      enrichedSteps ?? [],
    );

    return mergeValidationResults(staticResult, [
      ...triggerIssues,
      ...semanticIssues,
      ...metadataIssues,
      ...variableReferenceIssues,
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
      // Output schema enrichment is best-effort: if it cannot be computed,
      // validation still runs against the step's existing settings rather
      // than failing the whole validation.
      return step;
    }
  }

  private async validateStepTypeRequirements({
    workspaceId,
    steps,
    trigger,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
    trigger: WorkflowTrigger | null;
  }): Promise<WorkflowValidationIssue[]> {
    const issues: WorkflowValidationIssue[] = [];

    for (const step of steps) {
      switch (step.type) {
        case WorkflowActionType.AI_AGENT:
          issues.push(...validateWorkflowAiAgentStep(step));
          break;
        case WorkflowActionType.CODE:
        case WorkflowActionType.HTTP_REQUEST:
          issues.push(...validateWorkflowRuntimeOutputStep(step));
          break;
        case WorkflowActionType.LOGIC_FUNCTION:
          issues.push(
            ...(await this.validateLogicFunctionStep({ step, workspaceId })),
          );
          break;
        case WorkflowActionType.ITERATOR:
          issues.push(
            ...validateWorkflowIteratorStep({ step, steps, trigger }),
          );
          break;
      }
    }

    return issues;
  }

  private async validateLogicFunctionStep({
    step,
    workspaceId,
  }: {
    step: WorkflowLogicFunctionAction;
    workspaceId: string;
  }): Promise<WorkflowValidationIssue[]> {
    const issues: WorkflowValidationIssue[] = [];

    const declaredOutputSchema =
      await this.getLogicFunctionDeclaredOutputSchema({
        step,
        workspaceId,
      });

    issues.push(
      ...validateWorkflowLogicFunctionOutputSchemaMismatch({
        step,
        declaredOutputSchema,
      }),
    );

    if (hasWorkflowStepLevelOutputSchema(step)) {
      return issues;
    }

    if (isDefined(declaredOutputSchema)) {
      return issues;
    }

    issues.push(
      buildMissingWorkflowOutputSchemaIssue({ id: step.id, name: step.name }),
    );

    return issues;
  }

  private async getLogicFunctionDeclaredOutputSchema({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<BaseOutputSchemaV2 | undefined> {
    const input = step.settings?.input;
    const logicFunctionId =
      isObject(input) && 'logicFunctionId' in input
        ? input.logicFunctionId
        : undefined;

    if (!isNonEmptyString(logicFunctionId)) {
      return undefined;
    }

    try {
      const logicFunction =
        await this.workflowCommonWorkspaceService.getLogicFunctionById({
          logicFunctionId,
          workspaceId,
        });

      const declaredInputSchema =
        logicFunction?.workflowActionTriggerSettings?.outputSchema;

      if (!isNonEmptyArray(declaredInputSchema)) {
        return undefined;
      }

      const declaredOutputSchema =
        inputSchemaToOutputSchema(declaredInputSchema);

      if (Object.keys(declaredOutputSchema).length === 0) {
        return undefined;
      }

      return declaredOutputSchema;
    } catch {
      return undefined;
    }
  }

  private async validateWorkspaceMetadata({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const recordSteps = steps.filter((step) =>
      OBJECT_TARGETING_ACTION_TYPES.has(step.type),
    );

    if (recordSteps.length === 0) {
      return [];
    }

    const { objectIdByNameSingular, flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    const issues: WorkflowValidationIssue[] = [];

    for (const step of recordSteps) {
      const input = step.settings.input;
      const objectName =
        isObject(input) && 'objectName' in input ? input.objectName : undefined;

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

        continue;
      }

      if (step.type === WorkflowActionType.PICK_RECORD) {
        const loadBalanceError = getPickRecordLoadBalanceConfigError({
          step,
          objectIdByNameSingular,
          flatFieldMetadataMaps,
        });

        if (isDefined(loadBalanceError)) {
          issues.push({
            severity: 'error',
            code: 'INVALID_STEP_PARAMS',
            message: loadBalanceError,
            stepId: step.id,
          });
        }
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
