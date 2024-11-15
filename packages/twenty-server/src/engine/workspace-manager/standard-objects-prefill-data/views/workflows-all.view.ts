import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  WORKFLOW_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const workflowsAllView = (
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return {
    name: 'All Workflows',
    objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.workflow].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconSettingsAutomation',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.workflow].fields[
            WORKFLOW_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.workflow].fields[
            WORKFLOW_STANDARD_FIELD_IDS.statuses
          ],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.workflow].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.workflow].fields[
            WORKFLOW_STANDARD_FIELD_IDS.createdBy
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.workflow].fields[
            WORKFLOW_STANDARD_FIELD_IDS.versions
          ],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.workflow].fields[
            WORKFLOW_STANDARD_FIELD_IDS.runs
          ],
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
