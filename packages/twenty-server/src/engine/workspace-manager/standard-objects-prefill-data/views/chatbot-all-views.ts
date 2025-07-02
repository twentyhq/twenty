import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CHATBOT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const chatbotsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const chatbotObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.chatbot,
  );

  if (!chatbotObjectMetadata) {
    throw new Error('Chatbot object metadata not found');
  }

  return {
    name: 'All chatbots',
    objectMetadataId: chatbotObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconSettingsAutomation',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          chatbotObjectMetadata.fields.find(
            (field) => field.standardId === CHATBOT_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chatbotObjectMetadata.fields.find(
            (field) => field.standardId === CHATBOT_STANDARD_FIELD_IDS.statuses,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chatbotObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chatbotObjectMetadata.fields.find(
            (field) =>
              field.standardId === CHATBOT_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 3,
        isVisible: false,
        size: 150,
      },
      {
        fieldMetadataId:
          chatbotObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              CHATBOT_STANDARD_FIELD_IDS.whatsappIntegration,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
