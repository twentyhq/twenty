import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  isEmptyObject,
  isNonEmptyArray,
  isRecordFilterValueValid,
  resolveInput,
} from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-find-records-action.guard';
import { type WorkflowFindRecordsActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { resolveLimitInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/resolve-limit-input.util';
import { resolveOffsetInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/resolve-offset-input.util';

@Injectable()
export class FindRecordsWorkflowAction implements WorkflowAction {
  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      steps,
      stepId: currentStepId,
    });

    if (!isWorkflowFindRecordsAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a find records action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowFindRecordsActionInput;

    const { workspaceId } = runInfo;

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const { flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        workflowActionInput.objectName,
        workspaceId,
      );

    if (workflowActionInput.filter?.recordFilters) {
      for (const filter of workflowActionInput.filter.recordFilters) {
        if (!isRecordFilterValueValid(filter)) {
          // An unresolved/broken variable reference resolves to `undefined`
          // (see resolveInput/evalFromContext) - that's a genuine input
          // error, so keep failing the step to avoid silently building an
          // unfiltered query.
          if (isUndefined(filter.value)) {
            throw new WorkflowStepExecutorException(
              `Filter condition has an empty value after variable resolution. This likely means a workflow variable could not be resolved. Filter field: ${filter.fieldMetadataId}, operand: ${filter.operand}`,
              WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
            );
          }

          // A variable that resolved successfully to a legitimately empty
          // value (e.g. null for an optional relation that isn't set) is
          // valid business data, not a broken reference. Treat it as
          // "no records match" instead of aborting the whole run.
          return {
            result: {
              first: undefined,
              all: [],
              totalCount: 0,
            },
          };
        }
      }
    }

    const recordFilters = workflowActionInput.filter?.recordFilters;

    const gqlOperationFilter = isDefined(recordFilters)
      ? computeRecordGqlOperationFilter({
          fieldMetadataItems: Object.values(
            flatFieldMetadataMaps.byUniversalIdentifier,
          ).filter(isDefined),
          recordFilters,
          recordFilterGroups:
            workflowActionInput.filter?.recordFilterGroups ?? [],
          filterValueDependencies: {
            timeZone: 'UTC',
          },
        })
      : {};

    if (isNonEmptyArray(recordFilters) && isEmptyObject(gqlOperationFilter)) {
      throw new WorkflowStepExecutorException(
        'Filter could not be resolved to a valid query. Check that filtered fields exist and that grouped filters include their recordFilterGroups.',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const toolOutput = await this.findRecordsService.execute({
      objectName: workflowActionInput.objectName,
      filter: gqlOperationFilter,
      orderBy: workflowActionInput.orderBy?.gqlOperationOrderBy,
      limit: resolveLimitInput(workflowActionInput.limit),
      offset: resolveOffsetInput(workflowActionInput.offset),
      authContext: executionContext.authContext,
      rolePermissionConfig: executionContext.rolePermissionConfig,
      shouldBuildEffectiveSelectFields: false,
    });

    if (!toolOutput.success) {
      return { error: toolOutput.error || toolOutput.message };
    }

    const records = toolOutput.result?.records ?? [];
    const totalCount = toolOutput.result?.count ?? 0;

    return {
      result: {
        first: records[0],
        all: records,
        totalCount,
      },
    };
  }
}
