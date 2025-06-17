import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  WORKFLOW_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const workflowsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const workflowObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.workflow,
  );

  if (!workflowObjectMetadata) {
    throw new Error('Workflow object metadata not found');
  }

  return {
    name: 'All Workflows',
    objectMetadataId: workflowObjectMetadata.id,
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
          workflowObjectMetadata.fields.find(
            (field) => field.standardId === WORKFLOW_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_STANDARD_FIELD_IDS.statuses,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_STANDARD_FIELD_IDS.versions,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowObjectMetadata.fields.find(
            (field) => field.standardId === WORKFLOW_STANDARD_FIELD_IDS.runs,
          )?.id ?? '',
        position: 5,
        isVisible: false,
        size: 150,
      },
    ],
  };
};
