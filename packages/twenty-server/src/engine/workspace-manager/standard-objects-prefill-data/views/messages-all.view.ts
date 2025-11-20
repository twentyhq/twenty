import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const messagesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
  useCoreNaming = false,
) => {
  const messageObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.message,
  );

  if (!messageObjectMetadata) {
    throw new Error('Message object metadata not found');
  }

  return {
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Messages',
    objectMetadataId: messageObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) => field.standardId === MESSAGE_STANDARD_FIELD_IDS.subject,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) =>
              field.standardId === MESSAGE_STANDARD_FIELD_IDS.messageThread,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MESSAGE_STANDARD_FIELD_IDS.messageParticipants,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) =>
              field.standardId === MESSAGE_STANDARD_FIELD_IDS.receivedAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) =>
              field.standardId === MESSAGE_STANDARD_FIELD_IDS.headerMessageId,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) => field.standardId === MESSAGE_STANDARD_FIELD_IDS.text,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
