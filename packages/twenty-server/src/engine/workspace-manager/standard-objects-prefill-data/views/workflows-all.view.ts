import { msg } from '@lingui/core/macro';
import { v4 } from 'uuid';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  WORKFLOW_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { type TwentyStandardApplication } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

export const workflowsAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  applications,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  applications: TwentyStandardApplication;
}): ViewDefinition => {
  const workflowObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.workflow,
  );

  if (!workflowObjectMetadata) {
    throw new Error('Workflow object metadata not found');
  }

  const id = v4();

  return {
    id,
    universalIdentifier: id,
    applicationId: applications.twentyStandardApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Workflows',
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
