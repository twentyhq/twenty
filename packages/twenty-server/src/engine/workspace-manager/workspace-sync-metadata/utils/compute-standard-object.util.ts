import {
  ComputedPartialObjectMetadata,
  PartialObjectMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { ComputedPartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

export const computeStandardObject = (
  standardObjectMetadata: Omit<PartialObjectMetadata, 'standardId'> & {
    standardId: string | null;
  },
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
        const relationStandardId = createRelationDeterministicUuid({
          objectId: customObjectMetadata.id,
          standardId: data.standardId,
        });
        const foreignKeyStandardId = createForeignKeyDeterministicUuid({
          objectId: customObjectMetadata.id,
          standardId: data.standardId,
        });

        // Relation
        fields.push({
          ...data,
          ...rest,
          standardId: relationStandardId,
          defaultValue: null,
          targetColumnMap: {},
        });

        // Foreign key
        fields.push({
          ...rest,
          standardId: foreignKeyStandardId,
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
