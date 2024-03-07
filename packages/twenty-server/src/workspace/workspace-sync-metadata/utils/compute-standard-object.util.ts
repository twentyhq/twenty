import {
  ComputedPartialObjectMetadata,
  PartialObjectMetadata,
} from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { ComputedPartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const computeStandardObject = (
  standardObjectMetadata: PartialObjectMetadata,
  originalObjectMetadata: ObjectMetadataEntity,
  customObjectMetadataCollection: ObjectMetadataEntity[] = [],
): ComputedPartialObjectMetadata => {
  const fields: ComputedPartialFieldMetadata[] = [];

  for (const partialFieldMetadata of standardObjectMetadata.fields) {
    if ('paramsFactory' in partialFieldMetadata) {
      // Compute standard fields of custom object
      for (const customObjectMetadata of customObjectMetadataCollection) {
        const { paramsFactory, ...rest } = partialFieldMetadata;
        const { joinColumn, ...data } = paramsFactory(customObjectMetadata);

        // Relation
        fields.push({
          ...data,
          ...rest,
          defaultValue: null,
          targetColumnMap: {},
        });

        // Foreign key
        fields.push({
          ...rest,
          name: joinColumn,
          type: FieldMetadataType.UUID,
          label: `${data.label} ID (foreign key)`,
          description: `${data.description} id foreign key`,
          defaultValue: null,
          icon: undefined,
          targetColumnMap: generateTargetColumnMap(
            FieldMetadataType.UUID,
            rest.isCustom,
            joinColumn,
          ),
          isSystem: true,
        });
      }
    } else {
      const labelText =
        typeof partialFieldMetadata.label === 'function'
          ? partialFieldMetadata.label(originalObjectMetadata)
          : partialFieldMetadata.label;
      const descriptionText =
        typeof partialFieldMetadata.description === 'function'
          ? partialFieldMetadata.description(originalObjectMetadata)
          : partialFieldMetadata.description;

      fields.push({
        ...partialFieldMetadata,
        label: labelText,
        description: descriptionText,
      });
    }
  }

  return {
    ...standardObjectMetadata,
    fields,
  };
};
