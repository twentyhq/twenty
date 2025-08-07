import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { CUSTOMER_STANDARD_FIELD_IDS } from 'src/mkt-core/mkt-example/common/constants/custom-field-ids';
import { CUSTOM_OBJECT_IDS } from 'src/mkt-core/mkt-example/common/constants/custom-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
export const customersAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const customerObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === CUSTOM_OBJECT_IDS.customer,
  );

  if (!customerObjectMetadata) {
    throw new Error('Customer object metadata not found');
  }

  return {
    name: 'All Customers',
    objectMetadataId: customerObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconUser',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) => field.standardId === CUSTOMER_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.customerEmailPrimaryEmail,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.customerPhonePrimaryPhoneNumber,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.companyName,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.customerStatus,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.customerTier,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.customerTotalOrderValue,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === CUSTOMER_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          customerObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
