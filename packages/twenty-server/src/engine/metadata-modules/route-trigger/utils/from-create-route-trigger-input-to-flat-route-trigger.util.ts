import { v4 as uuidV4 } from 'uuid';

import { type CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const fromCreateRouteTriggerInputToFlatRouteTrigger = ({
  createRouteTriggerInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createRouteTriggerInput: CreateRouteTriggerInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatRouteTrigger => {
  const now = new Date();
  const id = uuidV4();

  return {
    id,
    universalIdentifier: createRouteTriggerInput.universalIdentifier ?? id,
    path: createRouteTriggerInput.path,
    isAuthRequired: createRouteTriggerInput.isAuthRequired,
    httpMethod: createRouteTriggerInput.httpMethod,
    serverlessFunctionId: createRouteTriggerInput.serverlessFunctionId,
    workspaceId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    applicationId: workspaceCustomApplicationId,
  };
};
