import { msg } from '@lingui/core/macro';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const customAllView = (
  objectMetadataItem: ObjectMetadataEntity,
  useCoreNaming = false,
) => {
  const nameField = objectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  const otherFields = objectMetadataItem.fields.filter(
    (field) => field.name !== 'name',
  );

  if (!nameField) {
    throw new Error(
      `Name field not found while creating All ${objectMetadataItem.namePlural} view`,
    );
  }

  return {
    name: useCoreNaming
      ? msg`All {objectLabelPlural}`
      : `All ${objectMetadataItem.labelPlural}`,
    objectMetadataId: objectMetadataItem.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    isCustom: false,
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataItem.fields.find((field) => field.name === 'name')
            ?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      ...otherFields.map((field, index) => ({
        fieldMetadataId: field.id,
        position: index + 1,
        isVisible: true,
        size: 180,
      })),
    ],
  };
};
