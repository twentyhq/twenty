import { v4 as uuidV4 } from 'uuid';

import { type CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const fromCreateDatabaseEventTriggerInputToFlatDatabaseEventTrigger = ({
  createDatabaseEventTriggerInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createDatabaseEventTriggerInput: CreateDatabaseEventTriggerInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatDatabaseEventTrigger => {
  const now = new Date().toISOString();
  const id = uuidV4();

  return {
    id,
    universalIdentifier:
      createDatabaseEventTriggerInput.universalIdentifier ?? id,
    settings: createDatabaseEventTriggerInput.settings,
    serverlessFunctionId: createDatabaseEventTriggerInput.serverlessFunctionId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    applicationId: workspaceCustomApplicationId,
  };
};
