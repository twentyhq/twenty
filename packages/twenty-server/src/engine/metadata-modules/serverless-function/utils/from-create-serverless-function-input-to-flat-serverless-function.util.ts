import { v4 } from 'uuid';

import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';
import { type CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { ServerlessFunctionRuntime } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const fromCreateServerlessFunctionInputToFlatServerlessFunction = ({
  createServerlessFunctionInput,
  workspaceId,
}: {
  createServerlessFunctionInput: CreateServerlessFunctionInput;
  workspaceId: string;
}): FlatServerlessFunction => {
  const id = v4();
  const universalIdentifier = v4();
  const currentDate = new Date();

  return {
    id,
    name: createServerlessFunctionInput.name,
    description: createServerlessFunctionInput.description ?? null,
    universalIdentifier,
    createdAt: currentDate,
    updatedAt: currentDate,
    deletedAt: null,
    latestVersion: null,
    publishedVersions: [],
    applicationId: null,
    latestVersionInputSchema: null,
    runtime: ServerlessFunctionRuntime.NODE22,
    timeoutSeconds: createServerlessFunctionInput.timeoutSeconds ?? 300,
    layerVersion: LAST_LAYER_VERSION,
    workspaceId,
    checksum: null,
  };
};
