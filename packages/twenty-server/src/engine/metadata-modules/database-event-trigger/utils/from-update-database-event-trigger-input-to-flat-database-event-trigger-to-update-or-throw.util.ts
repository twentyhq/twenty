import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type UpdateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/update-database-event-trigger.input';
import {
  DatabaseEventTriggerException,
  DatabaseEventTriggerExceptionCode,
} from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const fromUpdateDatabaseEventTriggerInputToFlatDatabaseEventTriggerToUpdateOrThrow =
  ({
    flatDatabaseEventTriggerMaps,
    updateDatabaseEventTriggerInput,
  }: {
    flatDatabaseEventTriggerMaps: FlatEntityMaps<FlatDatabaseEventTrigger>;
    updateDatabaseEventTriggerInput: UpdateDatabaseEventTriggerInput;
  }): FlatDatabaseEventTrigger => {
    const existingFlatDatabaseEventTrigger =
      flatDatabaseEventTriggerMaps.byId[updateDatabaseEventTriggerInput.id];

    if (!existingFlatDatabaseEventTrigger) {
      throw new DatabaseEventTriggerException(
        'Database event trigger not found',
        DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
      );
    }

    return {
      ...existingFlatDatabaseEventTrigger,
      settings: updateDatabaseEventTriggerInput.settings,
      updatedAt: new Date(),
    };
  };
