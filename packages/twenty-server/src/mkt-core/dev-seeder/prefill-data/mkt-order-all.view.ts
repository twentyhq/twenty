import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { MKT_ORDER_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktOrdersAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const orderObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktOrder,
  );

  if (!orderObjectMetadata) {
    throw new Error('Order object metadata not found');
  }

  return {
    name: 'All Orders',
    objectMetadataId: orderObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 1,
    icon: 'IconBox',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.orderCode,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.status,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.totalAmount,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.currency,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.note,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          orderObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_FIELD_IDS.requireContract,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
