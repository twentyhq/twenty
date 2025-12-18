import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const workflowRunsAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const workflowRunObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.workflowRun,
  );

  if (!workflowRunObjectMetadata) {
    throw new Error('Workflow run object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Workflow Runs',
    objectMetadataId: workflowRunObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconHistoryToggle',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
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
        universalIdentifier:
          STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.viewFields.name
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.viewFields.workflow
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.viewFields.status
            .universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.viewFields
            .startedAt.universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.viewFields
            .createdBy.universalIdentifier,
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
        universalIdentifier:
          STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.viewFields
            .workflowVersion.universalIdentifier,
      },
    ],
  };
};
