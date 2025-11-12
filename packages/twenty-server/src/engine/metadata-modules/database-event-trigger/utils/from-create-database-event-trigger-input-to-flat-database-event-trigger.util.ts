import { v4 as uuidV4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const fromCreateDatabaseEventTriggerInputToFlatDatabaseEventTrigger = ({
  createDatabaseEventTriggerInput,
  workspaceId,
  workspaceCustomFlatApplication,
}: {
  createDatabaseEventTriggerInput: CreateDatabaseEventTriggerInput;
  workspaceId: string;
  workspaceCustomFlatApplication: FlatApplication;
}): FlatDatabaseEventTrigger => {
  const now = new Date();
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
    applicationId: workspaceCustomFlatApplication.id,
  };
};
