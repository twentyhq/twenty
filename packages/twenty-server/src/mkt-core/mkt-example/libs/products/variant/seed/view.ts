import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
import { PRODUCT_VARIANT_STANDARD_FIELD_IDS } from '../constants';

export const productVariantsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const variantObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.id,
  );

  if (!variantObjectMetadata) {
    throw new Error('Product Variant object metadata not found');
  }

  return {
    name: 'All Product Variants',
    objectMetadataId: variantObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconBoxMultiple',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.product,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.sku,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.price,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
        aggregateOperation: AggregateOperations.SUM,
      },
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.stock,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_VARIANT_STANDARD_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          variantObjectMetadata.fields.find(
            (field) => field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
