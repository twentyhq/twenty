import { v4 } from 'uuid';

import { type CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import {
  DEFAULT_HANDLER_NAME,
  DEFAULT_HANDLER_PATH,
  ServerlessFunctionRuntime,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';

export type FromCreateServerlessFunctionInputToFlatServerlessFunctionArgs = {
  createServerlessFunctionInput: CreateServerlessFunctionInput & {
    serverlessFunctionLayerId: string;
  };
  workspaceId: string;
};

export const fromCreateServerlessFunctionInputToFlatServerlessFunction = ({
  createServerlessFunctionInput: rawCreateServerlessFunctionInput,
  workspaceId,
}: FromCreateServerlessFunctionInputToFlatServerlessFunctionArgs): FlatServerlessFunction => {
  const id = v4();
  const currentDate = new Date();

  return {
    cronTriggerIds: [],
    databaseEventTriggerIds: [],
    routeTriggerIds: [],
    id,
    name: rawCreateServerlessFunctionInput.name,
    description: rawCreateServerlessFunctionInput.description ?? null,
    handlerPath:
      rawCreateServerlessFunctionInput.handlerPath ?? DEFAULT_HANDLER_PATH,
    handlerName:
      rawCreateServerlessFunctionInput.handlerName ?? DEFAULT_HANDLER_NAME,
    universalIdentifier:
      rawCreateServerlessFunctionInput.universalIdentifier ?? v4(),
    createdAt: currentDate,
    updatedAt: currentDate,
    deletedAt: null,
    latestVersion: null,
    publishedVersions: [],
    applicationId: rawCreateServerlessFunctionInput.applicationId ?? null,
    runtime: ServerlessFunctionRuntime.NODE22,
    timeoutSeconds: rawCreateServerlessFunctionInput.timeoutSeconds ?? 300,
    serverlessFunctionLayerId:
      rawCreateServerlessFunctionInput.serverlessFunctionLayerId,
    workspaceId,
    code: rawCreateServerlessFunctionInput?.code,
    checksum: rawCreateServerlessFunctionInput?.code
      ? serverlessFunctionCreateHash(
          JSON.stringify(rawCreateServerlessFunctionInput.code),
        )
      : null,
  };
};
