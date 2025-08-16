import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_PRODUCT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktProductsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const productObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktProduct,
  );

  if (!productObjectMetadata) {
    throw new Error('Product object metadata not found');
  }

  return {
    name: 'All Products',
    objectMetadataId: productObjectMetadata.id ?? '',
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
          productObjectMetadata.fields.find(
            (field) => field.standardId === MKT_PRODUCT_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === MKT_PRODUCT_FIELD_IDS.code,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === MKT_PRODUCT_FIELD_IDS.category,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === MKT_PRODUCT_FIELD_IDS.price,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === MKT_PRODUCT_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
