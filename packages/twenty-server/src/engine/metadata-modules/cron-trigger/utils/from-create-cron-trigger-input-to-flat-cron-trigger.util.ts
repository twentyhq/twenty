import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const fromCreateCronTriggerInputToFlatCronTrigger = ({
  createCronTriggerInput,
  workspaceId,
  workspaceCustomFlatApplication,
}: {
  createCronTriggerInput: CreateCronTriggerInput;
  workspaceId: string;
  workspaceCustomFlatApplication: FlatApplication;
}): FlatCronTrigger => {
  const now = new Date();
  const id = v4();

  return {
    id,
    universalIdentifier: createCronTriggerInput.universalIdentifier ?? id,
    settings: createCronTriggerInput.settings,
    serverlessFunctionId: createCronTriggerInput.serverlessFunctionId,
    applicationId: workspaceCustomFlatApplication.id,
    workspaceId,
    createdAt: now,
    updatedAt: now,
  };
};
