import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const workflowRunsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const workflowRunObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.workflowRun,
  );

  if (!workflowRunObjectMetadata) {
    throw new Error('Workflow run object metadata not found');
  }

  return {
    name: 'All Workflow Runs',
    objectMetadataId: workflowRunObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconHistoryToggle',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          workflowRunObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_RUN_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowRunObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_RUN_STANDARD_FIELD_IDS.workflow,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowRunObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_RUN_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowRunObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowRunObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          workflowRunObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
