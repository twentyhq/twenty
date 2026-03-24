import { Injectable } from '@nestjs/common';

import { type EntityManager } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import {
  getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionDefinitions,
  type PrefilledWorkflowCodeStepLogicFunctionDefinition,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflow-code-step-logic-functions';

const DEFAULT_SOURCE_HANDLER_PATH = 'src/index.ts';
const DEFAULT_BUILT_HANDLER_PATH = 'src/index.mjs';
const DEFAULT_HANDLER_NAME = 'main';
const DEFAULT_LOGIC_FUNCTION_RUNTIME = 'nodejs22.x';
const DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS = 300;

export type CreatedPrefilledLogicFunctionResource = {
  applicationUniversalIdentifier: string;
  sourceHandlerPath: string;
  workspaceId: string;
};

@Injectable()
export class CreateCompanyWhenAddingNewPersonCodeStepLogicFunctionService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
  ) {}

  async ensureSeeded({
    entityManager,
    workspaceId,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
  }): Promise<CreatedPrefilledLogicFunctionResource[]> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const logicFunctionDefinitions =
      getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionDefinitions(
        workspaceId,
      );

    const existingLogicFunctions = await entityManager
      .createQueryBuilder()
      .select('logicFunction.id', 'id')
      .from('core.logicFunction', 'logicFunction')
      .where('logicFunction.workspaceId = :workspaceId', { workspaceId })
      .andWhere('logicFunction.id IN (:...ids)', {
        ids: logicFunctionDefinitions.map((definition) => definition.id),
      })
      .getRawMany<{ id: string }>();

    const existingLogicFunctionIds = new Set(
      existingLogicFunctions.map(({ id }) => id),
    );
    const createdResources: CreatedPrefilledLogicFunctionResource[] = [];

    for (const definition of logicFunctionDefinitions) {
      if (existingLogicFunctionIds.has(definition.id)) {
        continue;
      }

      const { sourceHandlerPath, builtHandlerPath } = this.buildHandlerPaths(
        definition.id,
      );

      await this.logicFunctionResourceService.uploadSourceFile({
        sourceHandlerPath,
        sourceHandlerCode: definition.sourceHandlerCode,
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        queryRunner: entityManager.queryRunner,
      });

      await this.insertLogicFunction({
        entityManager,
        workspaceId,
        applicationId: workspaceCustomFlatApplication.id,
        definition,
        sourceHandlerPath,
        builtHandlerPath,
      });

      createdResources.push({
        workspaceId,
        sourceHandlerPath,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });
    }

    return createdResources;
  }

  async cleanupSeededResources(
    createdResources: CreatedPrefilledLogicFunctionResource[],
  ): Promise<void> {
    await Promise.allSettled(
      createdResources.map(async (createdResource) => {
        await this.logicFunctionResourceService.deleteSourceFile(
          createdResource,
        );
      }),
    );
  }

  private buildHandlerPaths(logicFunctionId: string) {
    return {
      sourceHandlerPath: `${logicFunctionId}/${DEFAULT_SOURCE_HANDLER_PATH}`,
      builtHandlerPath: `${logicFunctionId}/${DEFAULT_BUILT_HANDLER_PATH}`,
    };
  }

  private async insertLogicFunction({
    entityManager,
    workspaceId,
    applicationId,
    definition,
    sourceHandlerPath,
    builtHandlerPath,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    applicationId: string;
    definition: PrefilledWorkflowCodeStepLogicFunctionDefinition;
    sourceHandlerPath: string;
    builtHandlerPath: string;
  }) {
    const now = new Date();

    await entityManager
      .createQueryBuilder()
      .insert()
      .into('core.logicFunction', [
        'id',
        'workspaceId',
        'universalIdentifier',
        'applicationId',
        'name',
        'description',
        'runtime',
        'timeoutSeconds',
        'checksum',
        'toolInputSchema',
        'isTool',
        'isBuildUpToDate',
        'handlerName',
        'sourceHandlerPath',
        'builtHandlerPath',
        'cronTriggerSettings',
        'databaseEventTriggerSettings',
        'httpRouteTriggerSettings',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ])
      .values([
        {
          id: definition.id,
          workspaceId,
          universalIdentifier: definition.id,
          applicationId,
          name: definition.name,
          description: definition.description,
          runtime: DEFAULT_LOGIC_FUNCTION_RUNTIME,
          timeoutSeconds: DEFAULT_LOGIC_FUNCTION_TIMEOUT_SECONDS,
          checksum: null,
          toolInputSchema: definition.toolInputSchema,
          isTool: false,
          isBuildUpToDate: false,
          handlerName: DEFAULT_HANDLER_NAME,
          sourceHandlerPath,
          builtHandlerPath,
          cronTriggerSettings: null,
          databaseEventTriggerSettings: null,
          httpRouteTriggerSettings: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ])
      .orIgnore()
      .execute();
  }
}
