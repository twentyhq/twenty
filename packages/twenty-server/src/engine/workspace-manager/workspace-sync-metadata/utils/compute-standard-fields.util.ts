import { FieldMetadataType } from 'twenty-shared';

import {
  ComputedPartialFieldMetadata,
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

export const computeStandardFields = (
  standardFieldMetadataCollection: (
    | PartialFieldMetadata
    | PartialComputedFieldMetadata
  )[],
  originalObjectMetadata: ObjectMetadataEntity,
  customObjectMetadataCollection: ObjectMetadataEntity[] = [],
): ComputedPartialFieldMetadata[] => {
  const fields: ComputedPartialFieldMetadata[] = [];

  for (const partialFieldMetadata of standardFieldMetadataCollection) {
    // Relation from standard object to custom object
    if ('argsFactory' in partialFieldMetadata) {
      // Compute standard fields of custom object
      for (const customObjectMetadata of customObjectMetadataCollection) {
        const { argsFactory, ...rest } = partialFieldMetadata;
        const { joinColumn, ...data } = argsFactory(customObjectMetadata);
        const relationStandardId = createRelationDeterministicUuid({
          objectId: customObjectMetadata.id,
          standardId: data.standardId,
        });
        const foreignKeyStandardId = createForeignKeyDeterministicUuid({
          objectId: customObjectMetadata.id,
          standardId: data.standardId,
        });

        if (!joinColumn) {
          throw new Error(
            `Missing joinColumn for field ${data.name} in object ${customObjectMetadata.nameSingular}`,
          );
        }

        // Relation
        fields.push({
          ...data,
          ...rest,
          standardId: relationStandardId,
          defaultValue: null,
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
          isSystem: true,
        });
      }
    } else {
      // Relation from standard object to standard object
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

  return fields;
};
