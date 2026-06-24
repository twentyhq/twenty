import { SEARCH_FIELDS_FOR_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_MESSAGE_FOLDER } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';

import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardSearchFieldArgs,
  createStandardSearchFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

export const buildMessageChannelMessageAssociationMessageFolderStandardFlatSearchFieldMetadatas =
  ({
    now,
    objectName,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
  }: Omit<
    CreateStandardSearchFieldArgs<'messageChannelMessageAssociationMessageFolder'>,
    'context'
  >): FlatSearchFieldMetadata[] =>
    SEARCH_FIELDS_FOR_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_MESSAGE_FOLDER.map(
      (searchField, position) =>
        createStandardSearchFieldFlatMetadata({
          objectName,
          workspaceId,
          context: {
            fieldName:
              searchField.name as AllStandardObjectFieldName<'messageChannelMessageAssociationMessageFolder'>,
            position,
          },
          standardObjectMetadataRelatedEntityIds,
          dependencyFlatEntityMaps,
          twentyStandardApplicationId,
          now,
        }),
    );
