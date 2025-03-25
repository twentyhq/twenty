import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CHATBOT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const chatbotsAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All chatbots',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.chatbot].id,
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
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.chatbot].fields[
            CHATBOT_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.chatbot].fields[
            CHATBOT_STANDARD_FIELD_IDS.statuses
          ],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.chatbot].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.chatbot].fields[
            CHATBOT_STANDARD_FIELD_IDS.createdBy
          ],
        position: 3,
        isVisible: false,
        size: 150,
      },
    ],
  };
};
