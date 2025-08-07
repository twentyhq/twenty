import {ObjectMetadataEntity} from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {BASE_OBJECT_STANDARD_FIELD_IDS} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {MKT_VARIANT_ATTRIBUTE_FIELD_IDS} from 'src/mkt-core/dev-seeder/constants/mkt-field-ids';
import {MKT_OBJECT_IDS} from 'src/mkt-core/dev-seeder/constants/mkt-object-ids';
import {ViewOpenRecordInType} from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktVariantAttributesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const valueObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktVariantAttribute,
  );

  if (!valueObjectMetadata) {
    throw new Error('Variant Attribute object metadata not found');
  }

  return {
    name: 'All Variant Attributes',
    objectMetadataId: valueObjectMetadata.id ?? '',
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
          valueObjectMetadata.fields.find(
            (field) => field.standardId === MKT_VARIANT_ATTRIBUTE_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === MKT_VARIANT_ATTRIBUTE_FIELD_IDS.mktAttribute,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          valueObjectMetadata.fields.find(
            (field) => field.standardId === MKT_VARIANT_ATTRIBUTE_FIELD_IDS.mktVariant,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
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
