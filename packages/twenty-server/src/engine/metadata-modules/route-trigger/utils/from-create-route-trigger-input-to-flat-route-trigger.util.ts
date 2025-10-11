import { v4 as uuidV4 } from 'uuid';

import { type CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const fromCreateRouteTriggerInputToFlatRouteTrigger = ({
  createRouteTriggerInput,
  workspaceId,
}: {
  createRouteTriggerInput: CreateRouteTriggerInput;
  workspaceId: string;
}): FlatRouteTrigger => {
  const now = new Date();

  return {
    id: uuidV4(),
    universalIdentifier:
      createRouteTriggerInput.universalIdentifier ?? uuidV4(),
    path: createRouteTriggerInput.path,
    isAuthRequired: createRouteTriggerInput.isAuthRequired,
    httpMethod: createRouteTriggerInput.httpMethod,
    serverlessFunctionId: createRouteTriggerInput.serverlessFunctionId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
  };
};
