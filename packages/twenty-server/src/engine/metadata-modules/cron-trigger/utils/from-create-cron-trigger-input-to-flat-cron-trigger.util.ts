import { v4 as uuidv4 } from 'uuid';

import { type CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const fromCreateCronTriggerInputToFlatCronTrigger = ({
  createCronTriggerInput,
  workspaceId,
}: {
  createCronTriggerInput: CreateCronTriggerInput;
  workspaceId: string;
}): FlatCronTrigger => {
  const now = new Date();

  return {
    id: uuidv4(),
    universalIdentifier: uuidv4(),
    settings: createCronTriggerInput.settings,
    serverlessFunctionId: createCronTriggerInput.serverlessFunctionId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
  };
};
