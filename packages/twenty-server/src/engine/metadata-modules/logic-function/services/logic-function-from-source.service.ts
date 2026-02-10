import { Injectable } from '@nestjs/common';

import { Sources } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { CreateDefaultLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-default-logic-function.input';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { LogicFunctionMetadataService } from 'src/engine/metadata-modules/logic-function/services/logic-function-metadata.service';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromFlatLogicFunctionToLogicFunctionDto } from 'src/engine/metadata-modules/logic-function/utils/from-flat-logic-function-to-logic-function-dto.util';

@Injectable()
export class LogicFunctionFromSourceService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionMetadataService: LogicFunctionMetadataService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async findOne({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<LogicFunctionDTO> {
    return await this.logicFunctionMetadataService.findOne({ id, workspaceId });
  }

  async findMany({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<LogicFunctionDTO[]> {
    return await this.logicFunctionMetadataService.findMany({ workspaceId });
  }

  async getAvailablePackages({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }) {
    return this.logicFunctionMetadataService.getAvailablePackages({
      logicFunctionId: id,
      workspaceId,
    });
  }

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

  async createDefault({
    input,
    workspaceId,
  }: {
    input: CreateDefaultLogicFunctionInput;
    workspaceId: string;
  }): Promise<LogicFunctionDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const logicFunctionId = input.id ?? v4();

    const { sourceHandlerPath, builtHandlerPath, handlerName, checksum } =
      await this.logicFunctionResourceService.seedSourceFiles({
        sourceSubfolder: logicFunctionId,
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
        },
        workspaceId,
        ownerFlatApplication: workspaceCustomFlatApplication,
      },
    );

    return fromFlatLogicFunctionToLogicFunctionDto({ flatLogicFunction });
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
      await this.logicFunctionResourceService.buildFromSource({
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

    if (flatLogicFunction.isBuildUpToDate) {
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
  }): Promise<Sources | null> {
    const { flatLogicFunction, applicationUniversalIdentifier } =
      await this.getLogicFunctionContext({ id, workspaceId });

    return this.logicFunctionResourceService.getSourceCode({
      workspaceId,
      applicationUniversalIdentifier,
      sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
    });
  }

  async updateLogicFunctionSource({
    id,
    code,
    workspaceId,
  }: {
    id: string;
    code: Sources;
    workspaceId: string;
  }): Promise<void> {
    const { flatLogicFunction, applicationUniversalIdentifier } =
      await this.getLogicFunctionContext({ id, workspaceId });

    await this.logicFunctionResourceService.updateSourceFiles({
      workspaceId,
      applicationUniversalIdentifier,
      sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
      code,
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
