import { Injectable } from '@nestjs/common';

import { isNonEmptyArray, isNonEmptyString, isObject } from '@sniptt/guards';
import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { OBJECT_TARGETING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/object-targeting-action-types.constant';
import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { buildMissingWorkflowOutputSchemaIssue } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/build-missing-workflow-output-schema-issue.util';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { hasWorkflowStepLevelOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-workflow-step-level-output-schema.util';
import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import { validateWorkflowIteratorStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-iterator-step.util';
import { validateWorkflowLogicFunctionOutputSchemaMismatch } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-logic-function-output-schema-mismatch.util';
import { validateWorkflowRuntimeOutputStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-runtime-output-step.util';
import { validateWorkflowStepsHaveVariableReferences } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-steps-have-variable-references.util';
import { validateWorkflowTriggerTypeRequirements } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-trigger-type-requirements.util';
import {
  type WorkflowAction,
  type WorkflowLogicFunctionAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type WorkflowVersionDefinition = {
  workspaceId: string;
  workflowVersionId: string;
  trigger: WorkflowTrigger | null | undefined;
  steps: WorkflowAction[] | null | undefined;
};

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  // Malformed content never reaches this method: the write chokepoint rejects it
  // before it is stored. What remains is everything that keeps a well-formed
  // draft from being activated, which is why the whole error set throws here.
  async assertWorkflowVersionIsActivableOrThrow({
    workspaceId,
    workflowVersionId,
    trigger,
    steps,
  }: WorkflowVersionDefinition): Promise<void> {
    const issues = await this.collectIssues({
      workspaceId,
      workflowVersionId,
      trigger: trigger ?? null,
      steps: steps ?? null,
    });

    const errors = issues.filter((issue) => issue.severity === 'error');

    if (errors.length === 0) {
      return;
    }

    throw new WorkflowVersionValidationException(
      WorkflowVersionValidationExceptionCode.NON_ACTIVABLE_WORKFLOW_VERSION,
      errors,
    );
  }

  private async collectIssues({
    workspaceId,
    workflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<WorkflowValidationIssue[]> {
    const { trigger: enrichedTrigger, steps: enrichedSteps } =
      await this.enrichOutputSchemas({
        workspaceId,
        workflowVersionId,
        trigger,
        steps,
      });

    const structureResult = validateWorkflowStructure({
      trigger: enrichedTrigger,
      steps: enrichedSteps,
    });

    const triggerIssues =
      validateWorkflowTriggerTypeRequirements(enrichedTrigger);

    const stepTypeIssues = await this.validateStepTypeRequirements({
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

    return [
      ...structureResult.errors,
      ...structureResult.warnings,
      ...triggerIssues,
      ...stepTypeIssues,
      ...metadataIssues,
      ...variableReferenceIssues,
    ];
  }

  private async enrichOutputSchemas({
    workspaceId,
    workflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    workflowVersionId: string;
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
    workflowVersionId: string;
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
        await this.workflowMetadataReadService.getLogicFunctionById({
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
    const hasRecordStep = steps.some((step) =>
      OBJECT_TARGETING_ACTION_TYPES.has(step.type),
    );

    if (!hasRecordStep) {
      return [];
    }

    const {
      objectIdByNameSingular,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    return getWorkflowRecordStepMetadataIssues({
      steps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    });
  }
}
