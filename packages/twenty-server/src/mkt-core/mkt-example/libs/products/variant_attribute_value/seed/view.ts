import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
import { VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS } from '../constants';

export const variantAttributeValuesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const valueObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.id,
  );

  if (!valueObjectMetadata) {
    throw new Error('Variant Attribute Value object metadata not found');
  }

  return {
    name: 'All Variant Attribute Values',
    objectMetadataId: valueObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconListDetails',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === VARIANT_ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.variant,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
      }
      // Bỏ trường createdAt vì đã tự tạo từ createdBy
    ],
  };
};
