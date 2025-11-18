import { msg } from '@lingui/core/macro';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  MESSAGE_THREAD_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const messageThreadsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
  useCoreNaming = false,
) => {
  const messageThreadObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.messageThread,
  );

  if (!messageThreadObjectMetadata) {
    throw new Error('MessageThread object metadata not found');
  }

  return {
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Message Threads',
    objectMetadataId: messageThreadObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          messageThreadObjectMetadata.fields.find(
            (field) =>
              field.standardId === MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          messageThreadObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
