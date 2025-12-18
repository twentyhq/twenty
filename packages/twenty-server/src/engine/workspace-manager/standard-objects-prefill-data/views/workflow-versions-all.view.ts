import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  WORKFLOW_VERSION_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const workflowVersionsAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const workflowVersionObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.workflowVersion,
  );

  if (!workflowVersionObjectMetadata) {
    throw new Error('Workflow version object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions
      .universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming
      ? msg`All {objectLabelPlural}`
      : 'All Workflow Versions',
    objectMetadataId: workflowVersionObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconVersions',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          workflowVersionObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions.viewFields
            .name.universalIdentifier,
      },
      {
        fieldMetadataId:
          workflowVersionObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_VERSION_STANDARD_FIELD_IDS.workflow,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions.viewFields
            .workflow.universalIdentifier,
      },
      {
        fieldMetadataId:
          workflowVersionObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_VERSION_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions.viewFields
            .status.universalIdentifier,
      },
      {
        fieldMetadataId:
          workflowVersionObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions.viewFields
            .updatedAt.universalIdentifier,
      },
      {
        fieldMetadataId:
          workflowVersionObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKFLOW_VERSION_STANDARD_FIELD_IDS.runs,
          )?.id ?? '',
        position: 4,
        isVisible: false,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions.viewFields
            .runs.universalIdentifier,
      },
    ],
  };
};
