import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const messagesAllView = ({
  objectMetadataItems,
  twentyStandardFlatApplication,
  useCoreNaming,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const messageObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.message,
  );

  if (!messageObjectMetadata) {
    throw new Error('Message object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.message.views.allMessages.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Messages',
    objectMetadataId: messageObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
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
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields.subject
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields.messageThread
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields
            .messageParticipants.universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields.receivedAt
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields.headerMessageId
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          messageObjectMetadata.fields.find(
            (field) => field.standardId === MESSAGE_STANDARD_FIELD_IDS.text,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 200,
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields.text
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.message.views.allMessages.viewFields.createdAt
            .universalIdentifier,
      },
    ],
  };
};
