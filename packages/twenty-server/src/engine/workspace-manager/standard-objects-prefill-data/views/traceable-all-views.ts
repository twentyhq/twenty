import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TRACEABLE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const tracaebleAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const traceableObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.traceable,
  );

  if (!traceableObjectMetadata) {
    throw new Error('Traceable object metadata not found');
  }

  return {
    name: 'All',
    objectMetadataId: traceableObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) => field.standardId === TRACEABLE_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId === TRACEABLE_STANDARD_FIELD_IDS.websiteUrl,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId === TRACEABLE_STANDARD_FIELD_IDS.campaignName,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId === TRACEABLE_STANDARD_FIELD_IDS.campaignSource,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              TRACEABLE_STANDARD_FIELD_IDS.meansOfCommunication,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId === TRACEABLE_STANDARD_FIELD_IDS.keyword,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId === TRACEABLE_STANDARD_FIELD_IDS.campaignContent,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          traceableObjectMetadata.fields.find(
            (field) =>
              field.standardId === TRACEABLE_STANDARD_FIELD_IDS.generatedUrl,
          )?.id ?? '',
        position: 7,
        isVisible: false,
        size: 150,
      },
    ],
  };
};
