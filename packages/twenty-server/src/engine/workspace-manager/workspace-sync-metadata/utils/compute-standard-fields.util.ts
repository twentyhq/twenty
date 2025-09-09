import {
  type ComputedPartialFieldMetadata,
  type PartialComputedFieldMetadata,
  type PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { createRelationDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

export const computeStandardFields = (
  _context: WorkspaceSyncContext,
  standardFieldMetadataCollection: (
    | PartialFieldMetadata
    | PartialComputedFieldMetadata
  )[],
  originalObjectMetadata: ObjectMetadataEntity,
  customObjectMetadataCollection: ObjectMetadataEntity[] = [],
): Omit<ComputedPartialFieldMetadata, 'createdAt' | 'updatedAt'>[] => {
  const fields: Omit<
    ComputedPartialFieldMetadata,
    'createdAt' | 'updatedAt'
  >[] = [];

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
          isNullable: true,
          isLabelSyncedWithName: true,
          isUnique: null,
          isUIReadOnly: false,
          options: null,
          relationTargetFieldMetadata: null,
          relationTargetFieldMetadataId: null,
          relationTargetObjectMetadata: null,
          relationTargetObjectMetadataId: null,
          settings: null,
          standardOverrides: null,
          morphId: null,
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
