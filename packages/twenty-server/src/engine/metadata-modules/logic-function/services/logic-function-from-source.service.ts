import { Injectable } from '@nestjs/common';

import { join } from 'path';

import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import { SEED_LOGIC_FUNCTION_INPUT_SCHEMA } from 'twenty-shared/logic-function';
import {
  type CronTriggerSettings,
  type DatabaseEventTriggerSettings,
  type HttpRouteTriggerSettings,
} from 'twenty-shared/application';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_SOURCE_HANDLER_PATH,
} from 'src/engine/metadata-modules/logic-function/constants/handler.contant';
import { CreateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function-from-source.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type CreateLogicFunctionParams } from 'src/engine/metadata-modules/logic-function/types/create-logic-function-params.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type UpdateLogicFunctionFromSourceParams } from 'src/engine/metadata-modules/logic-function/types/update-logic-function-from-source-params.type';
import { type UpdateLogicFunctionMetadataParams } from 'src/engine/metadata-modules/logic-function/types/update-logic-function-metadata-params.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromCreateLogicFunctionInputToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-from-source-input-to-flat-logic-function.util';
import { fromFlatLogicFunctionToLogicFunctionDto } from 'src/engine/metadata-modules/logic-function/utils/from-flat-logic-function-to-logic-function-dto.util';
import { fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow } from 'src/engine/metadata-modules/logic-function/utils/from-update-logic-function-input-to-flat-logic-function-to-update-or-throw.util';
import { getLogicFunctionSubfolderForFromSource } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-subfolder-for-from-source';
import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class LogicFunctionFromSourceService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly applicationService: ApplicationService,
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const logicFunctionId = input.id ?? v4();

    const { sourceHandlerPath, builtHandlerPath } =
      this.getHandlerPaths(logicFunctionId);

    if (input.source) {
      await this.logicFunctionResourceService.uploadSourceFile({
        sourceHandlerPath,
        sourceHandlerCode: input.source.sourceHandlerCode,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceId,
      });

      const flatLogicFunction = await this.createOneFromParams({
        input: {
          ...input,
          handlerName: input.source.handlerName,
          toolInputSchema: input.source.toolInputSchema,
          sourceHandlerPath,
          builtHandlerPath,
          id: logicFunctionId,
          isBuildUpToDate: false,
        },
        workspaceId,
        ownerFlatApplication: workspaceCustomFlatApplication,
      });

      return fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction });
    }

    const { handlerName, checksum } =
      await this.logicFunctionResourceService.seedSourceFiles({
        sourceHandlerPath,
        builtHandlerPath,
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    const flatLogicFunction = await this.createOneFromParams({
      input: {
        ...input,
        id: logicFunctionId,
        sourceHandlerPath,
        builtHandlerPath,
        handlerName,
        checksum,
        toolInputSchema: SEED_LOGIC_FUNCTION_INPUT_SCHEMA,
        isBuildUpToDate: true,
      },
      workspaceId,
      ownerFlatApplication: workspaceCustomFlatApplication,
    });

    return fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction });
  }

  private async createOneFromParams({
    input,
    workspaceId,
    ownerFlatApplication,
  }: {
    input: CreateLogicFunctionParams;
    ownerFlatApplication: FlatApplication;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const flatLogicFunctionToCreate =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: input,
        workspaceId,
        ownerFlatApplication: resolvedOwnerFlatApplication,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [flatLogicFunctionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating logic function',
      );
    }

    return flatLogicFunctionToCreate;
  }

  async duplicateOneWithSource({
    existingLogicFunctionId,
    workspaceId,
  }: {
    existingLogicFunctionId: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingLogicFunction = findFlatLogicFunctionOrThrow({
      id: existingLogicFunctionId,
      flatLogicFunctionMaps,
    });

    const ownerFlatApplication = (
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      )
    ).workspaceCustomFlatApplication;

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

    const created = await this.createOneFromParams({
      input: {
        id: newId,
        universalIdentifier: v4(),
        name: existingLogicFunction.name,
        description: existingLogicFunction.description ?? undefined,
        timeoutSeconds: existingLogicFunction.timeoutSeconds,
        toolInputSchema: existingLogicFunction.toolInputSchema ?? {},
        isTool: existingLogicFunction.isTool,
        isBuildUpToDate: existingLogicFunction.isBuildUpToDate,
        checksum: existingLogicFunction.checksum ?? '[default-checksum]',
        handlerName: existingLogicFunction.handlerName,
        sourceHandlerPath: toSourceHandlerPath,
        builtHandlerPath: toBuiltHandlerPath,
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
      ownerFlatApplication,
    });

    if (!isDefined(created)) {
      throw new LogicFunctionException(
        'Failed to duplicate logic function',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    return created;
  }

  async updateOne({
    id,
    update,
    workspaceId,
  }: {
    id: string;
    update: UpdateLogicFunctionFromSourceParams;
    workspaceId: string;
  }): Promise<void> {
    const { applicationUniversalIdentifier, flatLogicFunction } =
      await this.getLogicFunctionContext({ id, workspaceId });

    const { sourceHandlerCode, ...metadataFields } = update;

    let metadataUpdate: UpdateLogicFunctionMetadataParams = {
      ...metadataFields,
    };

    if (sourceHandlerCode) {
      await this.logicFunctionResourceService.uploadSourceFile({
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        sourceHandlerCode,
        applicationUniversalIdentifier,
        workspaceId,
      });

      metadataUpdate = {
        ...metadataUpdate,
        isBuildUpToDate: false,
      };
    }

    await this.updateMetadata({
      id,
      update: metadataUpdate,
      workspaceId,
    });
  }

  async deleteOne({
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
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    if (!isDefined(existingFlatLogicFunction)) {
      throw new LogicFunctionException(
        'Logic function to destroy not found',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

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
            resolvedOwnerFlatApplication.universalIdentifier,
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
    const { flatLogicFunction, applicationUniversalIdentifier } =
      await this.getLogicFunctionContext({ id, workspaceId });

    const { checksum } =
      await this.logicFunctionResourceService.buildFromSourceFile({
        workspaceId,
        applicationUniversalIdentifier,
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        builtHandlerPath: flatLogicFunction.builtHandlerPath,
      });

    await this.updateMetadata({
      id,
      update: { checksum, isBuildUpToDate: true },
      workspaceId,
    });
  }

  async executeOne({
    id,
    payload,
    workspaceId,
  }: {
    id: string;
    payload: object;
    workspaceId: string;
  }): Promise<LogicFunctionExecutionResultDTO> {
    const { flatLogicFunction } = await this.getLogicFunctionContext({
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
    const { flatLogicFunction, applicationUniversalIdentifier } =
      await this.getLogicFunctionContext({ id, workspaceId });

    return this.logicFunctionResourceService.getSourceFile({
      workspaceId,
      applicationUniversalIdentifier,
      sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
    });
  }

  private getHandlerPaths(logicFunctionId: string) {
    const logicFunctionSubfolder =
      getLogicFunctionSubfolderForFromSource(logicFunctionId);

    return {
      sourceHandlerPath: join(
        logicFunctionSubfolder,
        DEFAULT_SOURCE_HANDLER_PATH,
      ),
      builtHandlerPath: join(
        logicFunctionSubfolder,
        DEFAULT_BUILT_HANDLER_PATH,
      ),
    };
  }

  private async updateMetadata({
    id,
    update,
    workspaceId,
    ownerFlatApplication,
  }: {
    id: string;
    update: UpdateLogicFunctionMetadataParams;
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }) {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const optimisticallyUpdatedFlatLogicFunction =
      fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow({
        flatLogicFunctionMaps,
        updateLogicFunctionInput: { id, update },
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatLogicFunction.id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }

  private async getLogicFunctionContext({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    const [{ flatLogicFunctionMaps }, { workspaceCustomFlatApplication }] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        }),
        this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        ),
      ]);

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    return {
      flatLogicFunction,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    };
  }
}
