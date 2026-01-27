import { type ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const fromFlatServerlessFunctionToServerlessFunctionDto = ({
  flatServerlessFunction,
}: {
  flatServerlessFunction: FlatServerlessFunction;
}): ServerlessFunctionDTO => {
  return {
    id: flatServerlessFunction.id,
    name: flatServerlessFunction.name,
    description: flatServerlessFunction.description ?? undefined,
    runtime: flatServerlessFunction.runtime,
    timeoutSeconds: flatServerlessFunction.timeoutSeconds,
    latestVersion: flatServerlessFunction.latestVersion ?? undefined,
    sourceHandlerPath: flatServerlessFunction.sourceHandlerPath,
    builtHandlerPath: flatServerlessFunction.builtHandlerPath,
    handlerName: flatServerlessFunction.handlerName,
    publishedVersions: flatServerlessFunction.publishedVersions,
    toolInputSchema: flatServerlessFunction.toolInputSchema ?? undefined,
    isTool: flatServerlessFunction.isTool,
    applicationId: flatServerlessFunction.applicationId ?? undefined,
    workspaceId: flatServerlessFunction.workspaceId,
    createdAt: new Date(flatServerlessFunction.createdAt),
    updatedAt: new Date(flatServerlessFunction.updatedAt),
    cronTriggerSettings:
      flatServerlessFunction.cronTriggerSettings ?? undefined,
    databaseEventTriggerSettings:
      flatServerlessFunction.databaseEventTriggerSettings ?? undefined,
    httpRouteTriggerSettings:
      flatServerlessFunction.httpRouteTriggerSettings ?? undefined,
  };
};
