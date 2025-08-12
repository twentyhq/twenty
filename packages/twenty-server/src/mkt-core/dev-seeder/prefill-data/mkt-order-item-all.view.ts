import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { MKT_ORDER_ITEM_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktOrderItemsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const orderItemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktOrderItem,
  );

  if (!orderItemObjectMetadata) {
    throw new Error('Order Item object metadata not found');
  }

  return {
    name: 'All Order Items',
    objectMetadataId: orderItemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 1,
    icon: 'IconShoppingCartCog',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          orderItemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_ITEM_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          orderItemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_ITEM_FIELD_IDS.quantity,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 100,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          orderItemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_ITEM_FIELD_IDS.unitPrice,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          orderItemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_ITEM_FIELD_IDS.totalPrice,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          orderItemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_ITEM_FIELD_IDS.mktOrder,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          orderItemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_ORDER_ITEM_FIELD_IDS.mktProduct,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
