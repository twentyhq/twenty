import { Injectable } from '@nestjs/common';

import { join } from 'path';

import { v4 } from 'uuid';
import { SEED_LOGIC_FUNCTION_INPUT_SCHEMA } from 'twenty-shared/logic-function';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { LogicFunctionMetadataService } from 'src/engine/metadata-modules/logic-function/services/logic-function-metadata.service';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromFlatLogicFunctionToLogicFunctionDto } from 'src/engine/metadata-modules/logic-function/utils/from-flat-logic-function-to-logic-function-dto.util';
import { CreateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function-from-source.input';
import { UpdateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-from-source.input';
import { getLogicFunctionSubfolderForFromSource } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-subfolder-for-from-source';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_SOURCE_HANDLER_PATH,
} from 'src/engine/metadata-modules/logic-function/constants/handler.contant';

@Injectable()
export class LogicFunctionFromSourceService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionMetadataService: LogicFunctionMetadataService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async deleteOne({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<LogicFunctionDTO> {
    const flatLogicFunction =
      await this.logicFunctionMetadataService.destroyOne({
        id,
        workspaceId,
      });

    return fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction });
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

  async createOne({
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

      const flatLogicFunction =
        await this.logicFunctionMetadataService.createOne({
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

    const flatLogicFunction = await this.logicFunctionMetadataService.createOne(
      {
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
      },
    );

    return fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction });
  }

  async updateOne({
    id,
    update,
    workspaceId,
  }: {
    id: string;
    update: UpdateLogicFunctionFromSourceInput['update'];
    workspaceId: string;
  }): Promise<void> {
    const { applicationUniversalIdentifier, flatLogicFunction } =
      await this.getLogicFunctionContext({ id, workspaceId });

    let formattedUpdate: UpdateLogicFunctionFromSourceInput['update'] = {
      ...update,
    };

    if (update.sourceHandlerCode) {
      await this.logicFunctionResourceService.uploadSourceFile({
        sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
        sourceHandlerCode: update.sourceHandlerCode,
        applicationUniversalIdentifier,
        workspaceId,
      });

      formattedUpdate = {
        ...formattedUpdate,
        isBuildUpToDate: false,
      };
    }

    await this.logicFunctionMetadataService.updateOne({
      id,
      update: formattedUpdate,
      workspaceId,
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

    await this.logicFunctionMetadataService.updateOne({
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
