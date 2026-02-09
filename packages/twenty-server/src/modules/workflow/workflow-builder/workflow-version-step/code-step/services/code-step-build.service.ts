import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'twenty-shared/application';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionMetadataService } from 'src/engine/metadata-modules/logic-function/services/logic-function-metadata.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromCreateLogicFunctionInputToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-input-to-flat-logic-function.util';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { SEED_LOGIC_FUNCTION_INPUT_SCHEMA } from 'src/engine/core-modules/logic-function/logic-function-resource/constants/seed-logic-function-input-schema';
import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

const WORKFLOW_BASE_FOLDER_PREFIX = 'workflow';

@Injectable()
export class CodeStepBuildService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly logicFunctionMetadataService: LogicFunctionMetadataService,
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
  ) {}

  private getSourceSubfolderForCodeStep(logicFunctionId: string) {
    return `${WORKFLOW_BASE_FOLDER_PREFIX}/${logicFunctionId}`;
  }

  async createCodeStepLogicFunction({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const { sourceHandlerPath, builtHandlerPath, handlerName, checksum } =
      await this.logicFunctionResourceService.seedSourceFiles({
        sourceSubfolder: this.getSourceSubfolderForCodeStep(logicFunctionId),
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    return await this.logicFunctionMetadataService.createOne({
      input: {
        id: logicFunctionId,
        name: 'A Logic Function Code Workflow Step',
        description: '',
        sourceHandlerPath,
        builtHandlerPath,
        handlerName,
        checksum,
        toolInputSchema: SEED_LOGIC_FUNCTION_INPUT_SCHEMA,
      },
      workspaceId,
      ownerFlatApplication: workspaceCustomFlatApplication,
    });
  }

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

    const newUniversalIdentifier = v4();

    const { sourceHandlerPath, builtHandlerPath } = existingLogicFunction;

    const toSourceHandlerPath = sourceHandlerPath.replace(
      existingLogicFunction.id,
      newId,
    );

    const toBuiltHandlerPath = builtHandlerPath.replace(
      existingLogicFunction.id,
      newId,
    );

    await this.logicFunctionResourceService.copyResources({
      fromSourceHandlerPath: sourceHandlerPath,
      fromBuiltHandlerPath: builtHandlerPath,
      toSourceHandlerPath,
      toBuiltHandlerPath,
      workspaceId,
      applicationUniversalIdentifier,
    });

    const newFlatLogicFunction =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: {
          ...existingLogicFunction,
          id: newId,
          universalIdentifier: newUniversalIdentifier,
          description: existingLogicFunction.description ?? undefined,
          builtHandlerPath: toBuiltHandlerPath,
          sourceHandlerPath: toSourceHandlerPath,
          toolInputSchema: existingLogicFunction.toolInputSchema ?? {},
          checksum: existingLogicFunction.checksum ?? '[default-checksum]', // TODO: checksum should never be null, update column in logicFunction entity to set it non nullable
          cronTriggerSettings: existingLogicFunction.cronTriggerSettings as
            | JsonbProperty<CronTriggerSettings>
            | undefined,
          databaseEventTriggerSettings:
            existingLogicFunction.databaseEventTriggerSettings as
              | JsonbProperty<DatabaseEventTriggerSettings>
              | undefined,
          httpRouteTriggerSettings:
            existingLogicFunction.httpRouteTriggerSettings as
              | JsonbProperty<HttpRouteTriggerSettings>
              | undefined,
        },
        workspaceId,
        ownerFlatApplication: resolvedOwnerFlatApplication,
      });

    const created = await this.logicFunctionMetadataService.createOne({
      input: {
        ...newFlatLogicFunction,
        description: newFlatLogicFunction.description ?? undefined,
        checksum: newFlatLogicFunction.checksum ?? '[default-checksum]',
        toolInputSchema: newFlatLogicFunction.toolInputSchema ?? {},
        cronTriggerSettings: newFlatLogicFunction.cronTriggerSettings as
          | JsonbProperty<CronTriggerSettings>
          | undefined,
        databaseEventTriggerSettings:
          newFlatLogicFunction.databaseEventTriggerSettings as
            | JsonbProperty<DatabaseEventTriggerSettings>
            | undefined,
        httpRouteTriggerSettings:
          newFlatLogicFunction.httpRouteTriggerSettings as
            | JsonbProperty<HttpRouteTriggerSettings>
            | undefined,
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
        await this.logicFunctionResourceService.buildFromSource({
          sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
          builtHandlerPath: flatLogicFunction.builtHandlerPath,
          workspaceId,
          applicationUniversalIdentifier,
        });

      await this.logicFunctionMetadataService.updateChecksum({
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
