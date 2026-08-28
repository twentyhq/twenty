import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import {
  validateWorkflowStepParams,
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { getRecordCrudRichTextIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD = new Set<string>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
]);

@Injectable()
export class WorkflowVersionValidationGateService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
  ) {}

  async assertWorkflowVersionIsValidOrThrow({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null | undefined;
    steps: WorkflowAction[] | null | undefined;
  }): Promise<void> {
    const blockingIssues = [
      ...validateWorkflowStepParams({ trigger, steps }),
      ...(await this.getRecordCrudRichTextIssues({
        workspaceId,
        steps: steps ?? [],
      })),
    ].filter((issue) => issue.severity === 'error');

    if (blockingIssues.length === 0) {
      return;
    }

    throw new WorkflowQueryValidationException(
      `Workflow version is invalid: ${blockingIssues
        .map((issue) => issue.message)
        .join('; ')}`,
      WorkflowQueryValidationExceptionCode.INVALID_WORKFLOW_VERSION,
    );
  }

  private async getRecordCrudRichTextIssues({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const recordCrudSteps = steps.filter((step) =>
      RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD.has(step.type),
    );

    if (recordCrudSteps.length === 0) {
      return [];
    }

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    const issues: WorkflowValidationIssue[] = [];

    for (const step of recordCrudSteps) {
      const input =
        isObject(step.settings) && 'input' in step.settings
          ? step.settings.input
          : undefined;

      if (!isObject(input)) {
        continue;
      }

      const objectName = 'objectName' in input ? input.objectName : undefined;
      const objectRecord =
        'objectRecord' in input ? input.objectRecord : undefined;

      if (typeof objectName !== 'string' || !isObject(objectRecord)) {
        continue;
      }

      const objectId = objectIdByNameSingular[objectName];

      if (!isDefined(objectId)) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      issues.push(
        ...getRecordCrudRichTextIssues({
          objectRecord: objectRecord as Record<string, unknown>,
          objectMetadataInfo: {
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          },
          stepLabel: step.name ?? step.id,
          stepId: step.id,
        }),
      );
    }

    return issues;
  }
}
