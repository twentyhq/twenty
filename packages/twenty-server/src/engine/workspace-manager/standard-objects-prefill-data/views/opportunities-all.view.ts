import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const opportunitiesAllView = ({
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
    STANDARD_OBJECTS.opportunity.views.allOpportunities.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Opportunities',
    objectMetadataId: opportunityObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [],
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
          STANDARD_OBJECTS.opportunity.views.allOpportunities.viewFields.name
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
        aggregateOperation: AggregateOperations.AVG,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.allOpportunities.viewFields.amount
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
          STANDARD_OBJECTS.opportunity.views.allOpportunities.viewFields
            .createdBy.universalIdentifier,
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
        aggregateOperation: AggregateOperations.MIN,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.views.allOpportunities.viewFields
            .closeDate.universalIdentifier,
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
          STANDARD_OBJECTS.opportunity.views.allOpportunities.viewFields.company
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
          STANDARD_OBJECTS.opportunity.views.allOpportunities.viewFields
            .pointOfContact.universalIdentifier,
      },
    ],
  };
};
