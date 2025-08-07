import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
import { PRODUCT_STANDARD_FIELD_IDS } from './index';

export const productsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const productObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === PRODUCT_STANDARD_FIELD_IDS.id,
  );

  if (!productObjectMetadata) {
    throw new Error('Product object metadata not found');
  }

  return {
    name: 'All Products',
    objectMetadataId: productObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconBox',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.productName,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.productCode,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.productCategory,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.basePrice,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.licenseDurationMonths,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
