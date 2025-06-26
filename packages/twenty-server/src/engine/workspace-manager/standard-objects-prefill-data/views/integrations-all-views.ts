import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { INTEGRATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const integrationsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const integrationObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.integration,
  );

  if (!integrationObjectMetadata) {
    throw new Error('Integration object metadata not found');
  }

  return {
    name: 'All integrations',
    objectMetadataId: integrationObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          integrationObjectMetadata.fields.find(
            (field) => field.standardId === INTEGRATION_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          integrationObjectMetadata.fields.find(
            (field) =>
              field.standardId === INTEGRATION_STANDARD_FIELD_IDS.charge,
          )?.id ?? '',

        position: 1,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
