import { SEARCH_FIELDS_FOR_CALENDAR_CHANNEL_EVENT_ASSOCIATION } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardSearchFieldArgs,
  createStandardSearchFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

export const buildCalendarChannelEventAssociationStandardFlatSearchFieldMetadatas =
  ({
    now,
    objectName,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
  }: Omit<
    CreateStandardSearchFieldArgs<'calendarChannelEventAssociation'>,
    'context'
  >): FlatSearchFieldMetadata[] =>
    SEARCH_FIELDS_FOR_CALENDAR_CHANNEL_EVENT_ASSOCIATION.map(
      (searchField, position) =>
        createStandardSearchFieldFlatMetadata({
          objectName,
          workspaceId,
          context: {
            fieldName:
              searchField.name as AllStandardObjectFieldName<'calendarChannelEventAssociation'>,
            position,
          },
          standardObjectMetadataRelatedEntityIds,
          dependencyFlatEntityMaps,
          twentyStandardApplicationId,
          now,
        }),
    );
