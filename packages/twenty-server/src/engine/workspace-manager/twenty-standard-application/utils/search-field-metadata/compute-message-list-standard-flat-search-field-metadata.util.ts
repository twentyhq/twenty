import { SEARCH_FIELDS_FOR_MESSAGE_LIST } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';

import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardSearchFieldArgs,
  createStandardSearchFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

export const buildMessageListStandardFlatSearchFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardSearchFieldArgs<'messageList'>,
  'context'
>): FlatSearchFieldMetadata[] =>
  SEARCH_FIELDS_FOR_MESSAGE_LIST.map((searchField) =>
    createStandardSearchFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName:
          searchField.name as AllStandardObjectFieldName<'messageList'>,
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
  );
