import { v4 as uuidV4 } from 'uuid';

import { type CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const fromCreateDatabaseEventTriggerInputToFlatDatabaseEventTrigger = ({
  createDatabaseEventTriggerInput,
  workspaceId,
}: {
  createDatabaseEventTriggerInput: CreateDatabaseEventTriggerInput;
  workspaceId: string;
}): FlatDatabaseEventTrigger => {
  const now = new Date();

  return {
    id: uuidV4(),
    universalIdentifier: uuidV4(),
    settings: createDatabaseEventTriggerInput.settings,
    serverlessFunctionId: createDatabaseEventTriggerInput.serverlessFunctionId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
  };
};
