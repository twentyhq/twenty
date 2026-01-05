import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const opportunitiesByStageView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const opportunityObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.opportunity,
  );

  if (!opportunityObjectMetadata) {
    throw new Error('Opportunity object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.opportunity.views.byStage.universalIdentifier;

  const stageFieldMetadataId =
    opportunityObjectMetadata.fields.find(
      (field) => field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
    )?.id ?? '';

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`By Stage` : 'By Stage',
    objectMetadataId: opportunityObjectMetadata.id,
    type: 'kanban',
    key: null,
    position: 2,
    icon: 'IconLayoutKanban',
    kanbanAggregateOperation: AggregateOperations.SUM,
    kanbanAggregateOperationFieldMetadataId:
      opportunityObjectMetadata.fields.find(
        (field) => field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.amount,
      )?.id ?? '',
    filters: [],
    mainGroupByFieldMetadataId: stageFieldMetadataId,
    fields: [
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) => field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewFields.name
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewFields.amount
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewFields.createdBy
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewFields.closeDate
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewFields.company
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewFields.pointOfContact
            .universalIdentifier,
      },
    ],
    groups: [
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewGroups!.new
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewGroups!.screening
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewGroups!.meeting
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewGroups!.proposal
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          opportunityObjectMetadata.fields.find(
            (field) =>
              field.standardId === OPPORTUNITY_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.byStage.viewGroups!.customer
            .universalIdentifier,
      },
    ],
  };
};
