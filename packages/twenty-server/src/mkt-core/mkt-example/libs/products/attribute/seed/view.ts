import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
import { PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS } from '../constants';

export const productAttributesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const attributeObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.id,
  );

  if (!attributeObjectMetadata) {
    throw new Error('Product Attribute object metadata not found');
  }

  return {
    name: 'All Product Attributes',
    objectMetadataId: attributeObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconTag',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          attributeObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          attributeObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.product,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          attributeObjectMetadata.fields.find(
            (field) => field.standardId === PRODUCT_ATTRIBUTE_STANDARD_FIELD_IDS.displayOrder,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          attributeObjectMetadata.fields.find(
            (field) => field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
