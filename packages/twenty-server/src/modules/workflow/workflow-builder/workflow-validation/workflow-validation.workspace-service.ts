import { Injectable } from '@nestjs/common';

import {
  isNonEmptyArray,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';
import {
  getOutputSchemaFromValue,
  getOutputSchemaMismatchIssues,
  inputSchemaToOutputSchema,
} from 'twenty-shared/logic-function';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  collectOutputSchemaVariablePaths,
  extractVariablesFromInput,
  parseVariablePath,
  resolveVariablePathInOutputSchema,
  TRIGGER_STEP_ID,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
  type WorkflowValidationResult,
} from 'twenty-shared/workflow';

import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
  type WorkflowIteratorAction,
  type WorkflowLogicFunctionAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const RECORD_CRUD_ACTION_TYPES = new Set<WorkflowActionType>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.DELETE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
  WorkflowActionType.FIND_RECORDS,
]);

const VARIABLE_CONSUMING_ACTION_TYPES = new Set<WorkflowActionType>([
  WorkflowActionType.HTTP_REQUEST,
  WorkflowActionType.CODE,
  WorkflowActionType.LOGIC_FUNCTION,
  WorkflowActionType.SEND_EMAIL,
  ...RECORD_CRUD_ACTION_TYPES,
]);

const OBJECT_TARGETING_ACTION_TYPES = new Set<WorkflowActionType>([
  ...RECORD_CRUD_ACTION_TYPES,
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

    const triggerIssues = this.validateTriggerTypeRequirements(enrichedTrigger);

    const semanticIssues = await this.validateStepTypeRequirements({
      workspaceId,
      steps: enrichedSteps ?? [],
      trigger: enrichedTrigger,
    });

    const metadataIssues = await this.validateWorkspaceMetadata({
      workspaceId,
      steps: enrichedSteps ?? [],
    });

    const variableReferenceIssues = this.validateStepsHaveVariableReferences(
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
          issues.push(...this.validateAiAgentStep(step));
          break;
        case WorkflowActionType.CODE:
        case WorkflowActionType.HTTP_REQUEST:
          issues.push(...this.validateRuntimeOutputStep(step));
          break;
        case WorkflowActionType.LOGIC_FUNCTION:
          issues.push(
            ...(await this.validateLogicFunctionStep({ step, workspaceId })),
          );
          break;
        case WorkflowActionType.ITERATOR:
          issues.push(...this.validateIteratorStep({ step, steps, trigger }));
          break;
      }
    }

    return issues;
  }

  private validateIteratorStep({
    step,
    steps,
    trigger,
  }: {
    step: WorkflowIteratorAction;
    steps: WorkflowAction[];
    trigger: WorkflowTrigger | null;
  }): WorkflowValidationIssue[] {
    const items = step.settings?.input?.items;

    if (!isString(items) || !isValidVariable(items)) {
      return [];
    }

    const [variable] = extractVariablesFromInput(items);

    if (!isDefined(variable)) {
      return [];
    }

    const [referencedStepId, ...propertyPath] = parseVariablePath(variable);

    if (!isDefined(referencedStepId)) {
      return [];
    }

    const outputSchema =
      referencedStepId === TRIGGER_STEP_ID
        ? trigger?.settings?.outputSchema
        : steps.find((currentStep) => currentStep.id === referencedStepId)
            ?.settings?.outputSchema;

    if (!isDefined(outputSchema) || !isObject(outputSchema)) {
      return [];
    }

    const resolved = resolveVariablePathInOutputSchema({
      schema: outputSchema,
      propertyPath,
    });

    if (resolved.found && resolved.type === 'array') {
      return [];
    }

    const arrayPathSuggestions = collectOutputSchemaVariablePaths(outputSchema)
      .filter(
        (path) =>
          resolveVariablePathInOutputSchema({
            schema: outputSchema,
            propertyPath: path.split('.'),
          }).type === 'array',
      )
      .map((path) => `${referencedStepId}.${path}`);

    const hint = isNonEmptyArray(arrayPathSuggestions)
      ? `Did you mean "{{${arrayPathSuggestions[0]}}}"?${
          arrayPathSuggestions.length > 1
            ? ` Other options: ${arrayPathSuggestions
                .slice(1)
                .map((suggestion) => `{{${suggestion}}}`)
                .join(', ')}.`
            : ''
        }`
      : undefined;

    return [
      {
        severity: 'error',
        code: 'ITERATOR_ITEMS_NOT_ARRAY',
        message: `Iterator step "${step.name ?? step.id}" must iterate over an array, but "{{${variable}}}" is not an array.`,
        stepId: step.id,
        path: variable,
        ...(isDefined(hint) ? { hint } : {}),
        ...(isNonEmptyArray(arrayPathSuggestions)
          ? { suggestions: arrayPathSuggestions }
          : {}),
      },
    ];
  }

  private validateStepsHaveVariableReferences(
    steps: WorkflowAction[],
  ): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];

    for (const step of steps) {
      if (!VARIABLE_CONSUMING_ACTION_TYPES.has(step.type)) {
        continue;
      }

      const variables = extractVariablesFromInput(step.settings?.input);

      if (variables.length > 0) {
        continue;
      }

      issues.push({
        severity: 'warning',
        code: 'STEP_HAS_NO_VARIABLE_REFERENCE',
        message: `Step "${step.name ?? step.id}" does not reference any variable from previous steps.`,
        stepId: step.id,
      });
    }

    return issues;
  }

  private validateTriggerTypeRequirements(
    trigger: WorkflowTrigger | null,
  ): WorkflowValidationIssue[] {
    if (trigger?.type !== WorkflowTriggerType.WEBHOOK) {
      return [];
    }

    if (this.hasOutputSchema(trigger.settings)) {
      return [];
    }

    return [
      this.buildMissingOutputSchemaIssue({
        id: TRIGGER_STEP_ID,
        name: trigger.name,
      }),
    ];
  }

  private validateRuntimeOutputStep(
    step: WorkflowAction,
  ): WorkflowValidationIssue[] {
    if (this.hasStepLevelOutputSchema(step)) {
      return [];
    }

    return [
      this.buildMissingOutputSchemaIssue({ id: step.id, name: step.name }),
    ];
  }

  // A CODE/LOGIC_FUNCTION step exposes an output schema either through a
  // user-declared sample (expectedOutputSchema) or through a schema computed
  // after a draft/test run (outputSchema). The LINK placeholder is not usable.
  private hasStepLevelOutputSchema(step: WorkflowAction): boolean {
    return this.hasOutputSchema(step.settings);
  }

  private hasOutputSchema(
    settings:
      | { outputSchema?: unknown; expectedOutputSchema?: unknown }
      | null
      | undefined,
  ): boolean {
    const expectedOutputSchema = settings?.expectedOutputSchema;

    if (
      isObject(expectedOutputSchema) &&
      Object.keys(expectedOutputSchema).length > 0
    ) {
      return true;
    }

    const outputSchema = settings?.outputSchema;

    return (
      isObject(outputSchema) &&
      Object.keys(outputSchema).length > 0 &&
      !(
        '_outputSchemaType' in outputSchema &&
        outputSchema._outputSchemaType === 'LINK'
      )
    );
  }

  private buildMissingOutputSchemaIssue({
    id,
    name,
  }: {
    id: string;
    name?: string;
  }): WorkflowValidationIssue {
    return {
      severity: 'error',
      code: 'CODE_STEP_MISSING_OUTPUT_SCHEMA',
      message: `Step "${name ?? id}" has no output schema. Declare an expected output schema.`,
      stepId: id,
    };
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
      ...this.validateLogicFunctionOutputSchemaMismatch({
        step,
        declaredOutputSchema,
      }),
    );

    if (this.hasStepLevelOutputSchema(step)) {
      return issues;
    }

    if (isDefined(declaredOutputSchema)) {
      return issues;
    }

    issues.push(
      this.buildMissingOutputSchemaIssue({ id: step.id, name: step.name }),
    );

    return issues;
  }

  private validateLogicFunctionOutputSchemaMismatch({
    step,
    declaredOutputSchema,
  }: {
    step: WorkflowLogicFunctionAction;
    declaredOutputSchema: BaseOutputSchemaV2 | undefined;
  }): WorkflowValidationIssue[] {
    const expectedOutputSchema = step.settings?.expectedOutputSchema;

    if (
      !isDefined(declaredOutputSchema) ||
      !isObject(expectedOutputSchema) ||
      Object.keys(expectedOutputSchema).length === 0
    ) {
      return [];
    }

    const mismatchIssues = getOutputSchemaMismatchIssues(
      declaredOutputSchema,
      getOutputSchemaFromValue(expectedOutputSchema),
    );

    return mismatchIssues.map((mismatchIssue) => ({
      severity: 'warning',
      code: 'LOGIC_FUNCTION_OUTPUT_SCHEMA_MISMATCH',
      message: `Step "${step.name ?? step.id}" expected output schema does not match the function's declared output schema: ${mismatchIssue}`,
      stepId: step.id,
    }));
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

  private validateAiAgentStep(
    step: WorkflowAiAgentAction,
  ): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];

    if (!isNonEmptyString(step.settings?.input?.agentId)) {
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
      OBJECT_TARGETING_ACTION_TYPES.has(step.type),
    );

    if (recordSteps.length === 0) {
      return [];
    }

    const { objectIdByNameSingular } =
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
