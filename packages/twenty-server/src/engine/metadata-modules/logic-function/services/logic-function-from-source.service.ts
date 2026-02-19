import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import { SEED_LOGIC_FUNCTION_INPUT_SCHEMA } from 'twenty-shared/logic-function';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { CreateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function-from-source.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { type UpdateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-from-source.input';
import { buildUniversalFlatLogicFunctionToCreate } from 'src/engine/metadata-modules/logic-function/utils/build-universal-flat-logic-function-to-create.util';
import { fromCreateLogicFunctionFromSourceInputToUniversalFlatLogicFunctionToCreate } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-from-source-input-to-universal-flat-logic-function-to-create.util';
import { fromFlatLogicFunctionToLogicFunctionDto } from 'src/engine/metadata-modules/logic-function/utils/from-flat-logic-function-to-logic-function-dto.util';
import { fromUpdateLogicFunctionFromSourceInputToFlatLogicFunctionToUpdate } from 'src/engine/metadata-modules/logic-function/utils/from-update-logic-function-from-source-input-to-flat-logic-function-to-update.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class LogicFunctionFromSourceService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly applicationService: ApplicationService,
    private readonly helperService: LogicFunctionFromSourceHelperService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOneFromSource({
    input,
    workspaceId,
  }: {
    input: CreateLogicFunctionFromSourceInput;
    workspaceId: string;
  }): Promise<LogicFunctionDTO> {
    const { workspaceCustomFlatApplication: ownerFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const logicFunctionId = input.id ?? v4();

    const { sourceHandlerPath, builtHandlerPath } =
      this.helperService.buildHandlerPaths(logicFunctionId);

    if (input.source) {
      await this.logicFunctionResourceService.uploadSourceFile({
        sourceHandlerPath,
        sourceHandlerCode: input.source.sourceHandlerCode,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        workspaceId,
      });

      const universalFlatLogicFunctionToCreate =
        fromCreateLogicFunctionFromSourceInputToUniversalFlatLogicFunctionToCreate(
          {
            createLogicFunctionFromSourceInput: {
              ...input,
              id: logicFunctionId,
            },
            sourceHandlerPath,
            builtHandlerPath,
            handlerName: input.source.handlerName,
            checksum: null,
            toolInputSchema: input.source.toolInputSchema,
            isBuildUpToDate: false,
            applicationUniversalIdentifier:
              ownerFlatApplication.universalIdentifier,
          },
        );

      await this.helperService.createOneFromMetadata({
        universalFlatLogicFunctionToCreate,
        workspaceId,
      });

      return this.findFlatLogicFunctionByIdAndConvertToDto({
        id: universalFlatLogicFunctionToCreate.id,
        workspaceId,
      });
    }

    const { handlerName, checksum } =
      await this.logicFunctionResourceService.seedSourceFiles({
        sourceHandlerPath,
        builtHandlerPath,
        workspaceId,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
      });

    const universalFlatLogicFunctionToCreate =
      fromCreateLogicFunctionFromSourceInputToUniversalFlatLogicFunctionToCreate(
        {
          createLogicFunctionFromSourceInput: { ...input, id: logicFunctionId },
          sourceHandlerPath,
          builtHandlerPath,
          handlerName,
          checksum,
          toolInputSchema: SEED_LOGIC_FUNCTION_INPUT_SCHEMA,
          isBuildUpToDate: true,
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
        },
      );

    await this.helperService.createOneFromMetadata({
      universalFlatLogicFunctionToCreate,
      workspaceId,
    });

    return this.findFlatLogicFunctionByIdAndConvertToDto({
      id: universalFlatLogicFunctionToCreate.id,
      workspaceId,
    });
  }

  async duplicateOneWithSource({
    existingLogicFunctionId,
    workspaceId,
  }: {
    existingLogicFunctionId: string;
    workspaceId: string;
  }): Promise<{ id: string }> {
    const { flatLogicFunction: existingLogicFunction, ownerFlatApplication } =
      await this.helperService.findLogicFunctionAndApplicationOrThrow({
        id: existingLogicFunctionId,
        workspaceId,
      });

    const newId = v4();

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
      toSourceHandlerPath,
      fromBuiltHandlerPath: builtHandlerPath,
      toBuiltHandlerPath,
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
    });

    const universalFlatLogicFunctionToCreate =
      buildUniversalFlatLogicFunctionToCreate({
        id: newId,
        name: existingLogicFunction.name,
        description: existingLogicFunction.description,
        timeoutSeconds: existingLogicFunction.timeoutSeconds,
        toolInputSchema: existingLogicFunction.toolInputSchema,
        isTool: existingLogicFunction.isTool,
        isBuildUpToDate: existingLogicFunction.isBuildUpToDate,
        checksum: existingLogicFunction.checksum,
        handlerName: existingLogicFunction.handlerName,
        sourceHandlerPath: toSourceHandlerPath,
        builtHandlerPath: toBuiltHandlerPath,
        cronTriggerSettings: existingLogicFunction.cronTriggerSettings,
        databaseEventTriggerSettings:
          existingLogicFunction.databaseEventTriggerSettings,
        httpRouteTriggerSettings:
          existingLogicFunction.httpRouteTriggerSettings,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
      });

    const created = await this.helperService.createOneFromMetadata({
      universalFlatLogicFunctionToCreate,
      workspaceId,
    });

    if (!isDefined(created)) {
      throw new LogicFunctionException(
        'Failed to duplicate logic function',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    return { id: created.id };
  }

  async updateOneFromSource({
    updateLogicFunctionFromSourceInput,
    workspaceId,
  }: {
    updateLogicFunctionFromSourceInput: UpdateLogicFunctionFromSourceInput;
    workspaceId: string;
  }): Promise<void> {
    const { flatLogicFunction, ownerFlatApplication } =
      await this.helperService.findLogicFunctionAndApplicationOrThrow({
        id: updateLogicFunctionFromSourceInput.id,
        workspaceId,
      });

    const sourceHandlerCode =
      updateLogicFunctionFromSourceInput.update.sourceHandlerCode;

    if (sourceHandlerCode) {
      await this.logicFunctionResourceService.uploadSourceFile({
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        sourceHandlerCode,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        workspaceId,
      });
    }

    const flatLogicFunctionToUpdate =
      fromUpdateLogicFunctionFromSourceInputToFlatLogicFunctionToUpdate({
        updateLogicFunctionFromSourceInput,
        existingFlatLogicFunction: flatLogicFunction,
      });

    await this.helperService.updateOneFromMetadata({
      flatLogicFunctionToUpdate,
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
    });
  }

  async deleteOneWithSource({
    id,
    workspaceId,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    id: string;
    workspaceId: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<LogicFunctionDTO> {
    const {
      flatLogicFunction: existingFlatLogicFunction,
      ownerFlatApplication: resolvedOwnerFlatApplication,
    } = await this.helperService.findLogicFunctionAndApplicationOrThrow({
      id,
      workspaceId,
    });

    const effectiveOwnerFlatApplication =
      ownerFlatApplication ?? resolvedOwnerFlatApplication;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatLogicFunction],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
          applicationUniversalIdentifier:
            effectiveOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying logic function',
      );
    }

    return fromFlatLogicFunctionToLogicFunctionDto({
      flatLogicFunction: existingFlatLogicFunction,
    });
  }

  async buildOneFromSource({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatLogicFunction, ownerFlatApplication } =
      await this.helperService.findLogicFunctionAndApplicationOrThrow({
        id,
        workspaceId,
      });

    const { checksum } =
      await this.logicFunctionResourceService.buildFromSourceFile({
        workspaceId,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        builtHandlerPath: flatLogicFunction.builtHandlerPath,
      });

    await this.helperService.updateOneFromMetadata({
      flatLogicFunctionToUpdate: {
        ...flatLogicFunction,
        checksum,
        isBuildUpToDate: true,
        updatedAt: new Date().toISOString(),
      },
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
    });
  }

  async executeOneFromSource({
    id,
    payload,
    workspaceId,
  }: {
    id: string;
    payload: object;
    workspaceId: string;
  }): Promise<LogicFunctionExecutionResultDTO> {
    const { flatLogicFunction } =
      await this.helperService.findLogicFunctionAndApplicationOrThrow({
        id,
        workspaceId,
      });

    if (!flatLogicFunction.isBuildUpToDate) {
      await this.buildOneFromSource({ workspaceId, id });
    }

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: id,
      workspaceId,
      payload,
    });

    return {
      data: result.data as LogicFunctionExecutionResultDTO['data'],
      logs: result.logs,
      duration: result.duration,
      status: result.status,
      error: result.error
        ? {
            errorType: result.error.errorType,
            errorMessage: result.error.errorMessage,
            stackTrace: Array.isArray(result.error.stackTrace)
              ? result.error.stackTrace.join('\n')
              : result.error.stackTrace,
          }
        : undefined,
    };
  }

  async getSourceCode({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<string | null> {
    const { flatLogicFunction, ownerFlatApplication } =
      await this.helperService.findLogicFunctionAndApplicationOrThrow({
        id,
        workspaceId,
      });

    return this.logicFunctionResourceService.getSourceFile({
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
      sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
    });
  }

  private async findFlatLogicFunctionByIdAndConvertToDto({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<LogicFunctionDTO> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return fromFlatLogicFunctionToLogicFunctionDto({
      flatLogicFunction: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: flatLogicFunctionMaps,
      }),
    });
  }
}
