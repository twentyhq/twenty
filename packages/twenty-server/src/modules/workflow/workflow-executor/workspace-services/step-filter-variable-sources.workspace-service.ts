import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import {
  extractRawVariableNamePart,
  TRIGGER_STEP_ID,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { type StepFilterVariableSource } from 'src/modules/workflow/workflow-executor/utils/compute-step-filter-type-or-throw.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

// Their schema comes from a test run when no expected result is declared
const STEP_TYPES_WITH_TEST_RUN_SCHEMA: string[] = [
  WorkflowTriggerType.WEBHOOK,
  WorkflowActionType.CODE,
  WorkflowActionType.HTTP_REQUEST,
  WorkflowActionType.LOGIC_FUNCTION,
];

@Injectable()
export class StepFilterVariableSourcesWorkspaceService {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  // Schemas are computed from settings, since the saved ones can be empty or stale
  async buildVariableSources({
    stepFilters,
    trigger,
    steps,
    workspaceId,
  }: {
    stepFilters: StepFilter[];
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    workspaceId: string;
  }): Promise<StepFilterVariableSource[]> {
    const referencedStepIds = new Set(
      stepFilters
        .filter(
          (stepFilter) =>
            !isDefined(stepFilter.fieldMetadataId) &&
            isNonEmptyString(stepFilter.stepOutputKey),
        )
        .map((stepFilter) =>
          extractRawVariableNamePart({
            rawVariableName: stepFilter.stepOutputKey,
            part: 'stepId',
          }),
        ),
    );

    const referencedNodes = [
      { id: TRIGGER_STEP_ID, node: trigger },
      ...steps.map((step) => ({ id: step.id, node: step })),
    ].filter(({ id }) => referencedStepIds.has(id));

    return Promise.all(
      referencedNodes.map(async ({ id, node }) => ({
        id,
        type: node.type,
        outputSchema: await this.computeOutputSchema({
          node,
          workspaceId,
          trigger,
          steps,
        }),
      })),
    );
  }

  private async computeOutputSchema({
    node,
    workspaceId,
    trigger,
    steps,
  }: {
    node: WorkflowTrigger | WorkflowAction;
    workspaceId: string;
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
  }): Promise<unknown> {
    const computedOutputSchema =
      await this.workflowSchemaWorkspaceService.computeStepOutputSchema({
        step: node,
        workspaceId,
        workflowVersionContent: { trigger, steps },
      });

    const isAwaitingTestRunSchema =
      STEP_TYPES_WITH_TEST_RUN_SCHEMA.includes(node.type) &&
      isEmptyObject(computedOutputSchema);

    if (isAwaitingTestRunSchema) {
      return node.settings.outputSchema;
    }

    return computedOutputSchema;
  }
}
