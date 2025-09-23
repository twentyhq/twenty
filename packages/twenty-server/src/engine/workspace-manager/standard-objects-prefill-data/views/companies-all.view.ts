import { msg } from '@lingui/core/macro';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const companiesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
  useCoreNaming = false,
) => {
  const companyObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.company,
  );

  if (!companyObjectMetadata) {
    throw new Error('Company object metadata not found');
  }

  return {
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Companies',
    objectMetadataId: companyObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
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
      },
    ],
  };
};
