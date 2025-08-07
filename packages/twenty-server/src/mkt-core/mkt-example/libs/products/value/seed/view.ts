import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
import { ATTRIBUTE_VALUE_STANDARD_FIELD_IDS } from '../constants';

export const attributeValuesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const valueObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.id,
  );

  if (!valueObjectMetadata) {
    throw new Error('Attribute Value object metadata not found');
  }

  return {
    name: 'All Attribute Values',
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
            (field) => field.standardId === ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.attributeId,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.value,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === ATTRIBUTE_VALUE_STANDARD_FIELD_IDS.displayOrder,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
