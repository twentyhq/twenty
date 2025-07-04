import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PRODUCT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const productsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const productObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.product,
  );

  if (!productObjectMetadata) {
    throw new Error('Products object metadata not found');
  }

  return {
    name: 'All',
    objectMetadataId: productObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconBox',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) =>
              field.standardId === PRODUCT_STANDARD_FIELD_IDS.salePrice,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.cost,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) =>
              field.standardId === PRODUCT_STANDARD_FIELD_IDS.unitOfMeasure,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          productObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
