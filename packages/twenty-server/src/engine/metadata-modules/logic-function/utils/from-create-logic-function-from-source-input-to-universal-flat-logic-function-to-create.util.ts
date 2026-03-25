import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type CreateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function-from-source.input';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export const fromCreateLogicFunctionFromSourceInputToUniversalFlatLogicFunctionToCreate =
  ({
    createLogicFunctionFromSourceInput,
    sourceHandlerPath,
    builtHandlerPath,
    handlerName,
    checksum,
    toolInputSchema,
    isBuildUpToDate,
    applicationUniversalIdentifier,
  }: {
    createLogicFunctionFromSourceInput: CreateLogicFunctionFromSourceInput;
    sourceHandlerPath: string;
    builtHandlerPath: string;
    handlerName: string;
    checksum: string | null;
    toolInputSchema: object | null;
    isBuildUpToDate: boolean;
    applicationUniversalIdentifier: string;
  }): UniversalFlatLogicFunction & { id: string } => {
    const now = new Date().toISOString();

    const { name, description } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        createLogicFunctionFromSourceInput,
        ['name', 'description'],
      );

    const id = createLogicFunctionFromSourceInput.id ?? v4();

    return {
      id,
      universalIdentifier:
        createLogicFunctionFromSourceInput.universalIdentifier ?? v4(),
      name,
      description: description ?? null,
      runtime: LogicFunctionRuntime.NODE22,
      timeoutSeconds: createLogicFunctionFromSourceInput.timeoutSeconds ?? 300,
      checksum,
      toolInputSchema,
      isTool: createLogicFunctionFromSourceInput.isTool ?? false,
      isBuildUpToDate,
      handlerName,
      sourceHandlerPath,
      builtHandlerPath,
      cronTriggerSettings:
        createLogicFunctionFromSourceInput.cronTriggerSettings ?? null,
      databaseEventTriggerSettings:
        createLogicFunctionFromSourceInput.databaseEventTriggerSettings ?? null,
      httpRouteTriggerSettings:
        createLogicFunctionFromSourceInput.httpRouteTriggerSettings ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      applicationUniversalIdentifier,
    };
  };
