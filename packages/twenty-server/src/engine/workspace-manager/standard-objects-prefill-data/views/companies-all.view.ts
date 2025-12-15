import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const companiesAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const companyObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.company,
  );

  if (!companyObjectMetadata) {
    throw new Error('Company object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.company.views.allCompanies.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Companies',
    objectMetadataId: companyObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) => field.standardId === COMPANY_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.name
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) =>
              field.standardId === COMPANY_STANDARD_FIELD_IDS.domainName,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 100,
        aggregateOperation: AggregateOperations.COUNT,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.domainName
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) =>
              field.standardId === COMPANY_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.createdBy
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) =>
              field.standardId === COMPANY_STANDARD_FIELD_IDS.accountOwner,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.accountOwner
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.createdAt
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) =>
              field.standardId === COMPANY_STANDARD_FIELD_IDS.employees,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MAX,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.employees
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) =>
              field.standardId === COMPANY_STANDARD_FIELD_IDS.linkedinLink,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 170,
        aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.linkedinLink
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          companyObjectMetadata.fields.find(
            (field) => field.standardId === COMPANY_STANDARD_FIELD_IDS.address,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 170,
        aggregateOperation: AggregateOperations.COUNT_NOT_EMPTY,
        universalIdentifier:
          STANDARD_OBJECTS.company.views.allCompanies.viewFields.address
            .universalIdentifier,
      },
    ],
  };
};
