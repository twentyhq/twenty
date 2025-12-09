import { v4 } from 'uuid';

import { type CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const fromCreateCronTriggerInputToFlatCronTrigger = ({
  createCronTriggerInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createCronTriggerInput: CreateCronTriggerInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatCronTrigger => {
  const now = new Date().toISOString();
  const id = v4();

  return {
    id,
    universalIdentifier: createCronTriggerInput.universalIdentifier ?? id,
    settings: createCronTriggerInput.settings,
    serverlessFunctionId: createCronTriggerInput.serverlessFunctionId,
    applicationId: workspaceCustomApplicationId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
  };
};
