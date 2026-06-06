import { Injectable, Logger } from '@nestjs/common';

import { SEED_WORKFLOW_ACTION_TRIGGER_SETTINGS } from 'twenty-shared/logic-function';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { extractCodeStepLogicFunctionIdsFromWorkflowSteps } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/utils/extract-code-step-logic-function-ids-from-workflow-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

@Injectable()
export class CodeStepBuildService {
  private readonly logger = new Logger(CodeStepBuildService.name);

  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
    private readonly logicFunctionFromSourceHelperService: LogicFunctionFromSourceHelperService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async createCodeStepLogicFunction({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }) {
    return await this.logicFunctionFromSourceService.createOneFromSource({
      input: {
        id: logicFunctionId,
        name: 'A Code Step',
        description: '',
        workflowActionTriggerSettings: SEED_WORKFLOW_ACTION_TRIGGER_SETTINGS,
      },
      workspaceId,
    });
  }

  async duplicateCodeStepLogicFunction({
    existingLogicFunctionId,
    workspaceId,
  }: {
    existingLogicFunctionId: string;
    workspaceId: string;
  }): Promise<{ id: string }> {
    return this.logicFunctionFromSourceService.duplicateOneWithSource({
      existingLogicFunctionId,
      workspaceId,
    });
  }

  async buildCodeStepsFromSourceForSteps({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<void> {
    const logicFunctionIds =
      extractCodeStepLogicFunctionIdsFromWorkflowSteps(steps);

    if (logicFunctionIds.length === 0) {
      return;
    }

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    for (const logicFunctionId of logicFunctionIds) {
      const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: logicFunctionId,
        flatEntityMaps: flatLogicFunctionMaps,
      });

      if (
        !isDefined(flatLogicFunction) ||
        flatLogicFunction.deletedAt ||
        flatLogicFunction.isBuildUpToDate
      ) {
        continue;
      }

      const applicationUniversalIdentifier = isDefined(
        flatLogicFunction.applicationId,
      )
        ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
            ?.universalIdentifier
        : undefined;

      if (!isDefined(applicationUniversalIdentifier)) {
        this.logger.warn(
          `Skipping build for logic function '${logicFunctionId}' (workspace=${workspaceId}): ` +
            `applicationId=${flatLogicFunction.applicationId ?? 'null'} did not resolve to an application. ` +
            `The function will not be rebuilt and may stay out of date.`,
        );
        continue;
      }

      await this.logicFunctionFromSourceService.buildOneFromSource({
        workspaceId,
        id: logicFunctionId,
      });
    }
  }

  async switchCodeStepLogicFunctionsToPrebuilt({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<void> {
    const isPrebuiltModeEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED,
        workspaceId,
      );

    if (!isPrebuiltModeEnabled) {
      return;
    }

    const logicFunctionIds =
      extractCodeStepLogicFunctionIdsFromWorkflowSteps(steps);

    if (logicFunctionIds.length === 0) {
      return;
    }

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    for (const logicFunctionId of logicFunctionIds) {
      const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: logicFunctionId,
        flatEntityMaps: flatLogicFunctionMaps,
      });

      if (
        !isDefined(flatLogicFunction) ||
        isDefined(flatLogicFunction.deletedAt)
      ) {
        throw new WorkflowTriggerException(
          `CODE step references logic function '${logicFunctionId}' that is missing or deleted`,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        );
      }

      if (
        !flatLogicFunction.isBuildUpToDate ||
        !isDefined(flatLogicFunction.checksum)
      ) {
        throw new WorkflowTriggerException(
          `Logic function '${logicFunctionId}' has no fresh build or checksum after the build step`,
          WorkflowTriggerExceptionCode.INTERNAL_ERROR,
        );
      }

      if (
        flatLogicFunction.executionMode === LogicFunctionExecutionMode.PREBUILT
      ) {
        continue;
      }

      const applicationUniversalIdentifier = isDefined(
        flatLogicFunction.applicationId,
      )
        ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
            ?.universalIdentifier
        : undefined;

      if (!isDefined(applicationUniversalIdentifier)) {
        throw new WorkflowTriggerException(
          `Logic function '${logicFunctionId}' references applicationId='${flatLogicFunction.applicationId ?? 'null'}' that did not resolve to an application`,
          WorkflowTriggerExceptionCode.INTERNAL_ERROR,
        );
      }

      await this.logicFunctionFromSourceHelperService.updateOneFromMetadata({
        flatLogicFunctionToUpdate: {
          ...flatLogicFunction,
          executionMode: LogicFunctionExecutionMode.PREBUILT,
          updatedAt: new Date().toISOString(),
        },
        workspaceId,
        applicationUniversalIdentifier,
      });
    }
  }
}
