import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { LogicFunctionSourceBuilderService } from 'src/engine/core-modules/logic-function/logic-function-source-builder/logic-function-source-builder.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromCreateLogicFunctionInputToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-input-to-flat-logic-function.util';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKFLOW_BASE_FOLDER_PREFIX = 'workflow';

@Injectable()
export class CodeStepBuildService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly logicFunctionService: LogicFunctionService,
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionSourceBuilderService: LogicFunctionSourceBuilderService,
  ) {}

  async duplicateCodeStepLogicFunction({
    existingLogicFunctionId,
    workspaceId,
  }: {
    existingLogicFunctionId: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingLogicFunction = findFlatLogicFunctionOrThrow({
      id: existingLogicFunctionId,
      flatLogicFunctionMaps,
    });

    const resolvedOwnerFlatApplication = (
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      )
    ).workspaceCustomFlatApplication;

    const applicationUniversalIdentifier =
      resolvedOwnerFlatApplication.universalIdentifier;

    const newId = v4();
    const newFlatLogicFunction =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: {
          name: existingLogicFunction.name,
          description: existingLogicFunction.description ?? undefined,
          timeoutSeconds: existingLogicFunction.timeoutSeconds,
          id: newId,
        },
        workspaceId,
        ownerFlatApplication: resolvedOwnerFlatApplication,
      });

    await this.logicFunctionSourceBuilderService.copySourceAndBuilt({
      fromSourceHandlerPath: existingLogicFunction.sourceHandlerPath,
      fromBuiltHandlerPath: existingLogicFunction.builtHandlerPath,
      toSourceHandlerPath: newFlatLogicFunction.sourceHandlerPath,
      toBuiltHandlerPath: newFlatLogicFunction.builtHandlerPath,
      workspaceId,
      applicationUniversalIdentifier,
    });

    const created = await this.logicFunctionService.createOne({
      input: {
        name: existingLogicFunction.name,
        description: existingLogicFunction.description ?? undefined,
        timeoutSeconds: existingLogicFunction.timeoutSeconds,
        id: newFlatLogicFunction.id,
        sourceHandlerPath: newFlatLogicFunction.sourceHandlerPath,
        builtHandlerPath: newFlatLogicFunction.builtHandlerPath,
        checksum: existingLogicFunction.checksum ?? undefined,
      },
      workspaceId,
      ownerFlatApplication: resolvedOwnerFlatApplication,
    });

    if (!isDefined(created)) {
      throw new Error(
        'Failed to create logic function when duplicating code step',
      );
    }

    return created;
  }

  async buildCodeStepsFromSourceForSteps({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<void> {
    const codeSteps = steps.filter(
      (
        step,
      ): step is WorkflowAction & {
        type: typeof WorkflowActionType.CODE;
        settings: { input: { logicFunctionId: string } };
      } =>
        step.type === WorkflowActionType.CODE &&
        isDefined(
          (step.settings?.input as { logicFunctionId?: string })
            ?.logicFunctionId,
        ),
    );

    if (codeSteps.length === 0) {
      return;
    }

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    for (const step of codeSteps) {
      const logicFunctionId = step.settings.input.logicFunctionId;
      const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: logicFunctionId,
        flatEntityMaps: flatLogicFunctionMaps,
      });

      if (
        !isDefined(flatLogicFunction) ||
        flatLogicFunction.deletedAt ||
        !this.isWorkflowCodeStepLogicFunction(flatLogicFunction)
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
        continue;
      }

      const { checksum } =
        await this.logicFunctionSourceBuilderService.buildFromSource({
          sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
          builtHandlerPath: flatLogicFunction.builtHandlerPath,
          workspaceId,
          applicationUniversalIdentifier,
        });

      await this.logicFunctionService.updateChecksum({
        id: flatLogicFunction.id,
        checksum,
        workspaceId,
      });
    }
  }

  isWorkflowCodeStepLogicFunction(
    flatLogicFunction: FlatLogicFunction,
  ): boolean {
    return (
      flatLogicFunction.sourceHandlerPath.startsWith(
        `${WORKFLOW_BASE_FOLDER_PREFIX}/`,
      ) ||
      flatLogicFunction.builtHandlerPath.startsWith(
        `${WORKFLOW_BASE_FOLDER_PREFIX}/`,
      )
    );
  }

  async getFlatLogicFunctionForCodeStepOrNull({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction | null> {
    const { flatLogicFunctionMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    if (
      !isDefined(flatLogicFunction) ||
      flatLogicFunction.deletedAt ||
      !this.isWorkflowCodeStepLogicFunction(flatLogicFunction)
    ) {
      return null;
    }

    return flatLogicFunction;
  }
}
