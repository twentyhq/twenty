import { v4 as uuidV4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const fromCreateRouteTriggerInputToFlatRouteTrigger = ({
  createRouteTriggerInput,
  workspaceId,
  workspaceCustomFlatApplication,
}: {
  createRouteTriggerInput: CreateRouteTriggerInput;
  workspaceId: string;
  workspaceCustomFlatApplication: FlatApplication;
}): FlatRouteTrigger => {
  const now = new Date();
  const id = uuidV4();

  return {
    id,
    universalIdentifier:
      createRouteTriggerInput.universalIdentifier ?? id,
    path: createRouteTriggerInput.path,
    isAuthRequired: createRouteTriggerInput.isAuthRequired,
    httpMethod: createRouteTriggerInput.httpMethod,
    serverlessFunctionId: createRouteTriggerInput.serverlessFunctionId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    applicationId: workspaceCustomFlatApplication.id,
  };
};
