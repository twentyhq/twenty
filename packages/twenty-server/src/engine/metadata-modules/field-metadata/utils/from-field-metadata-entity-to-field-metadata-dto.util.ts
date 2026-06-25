import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

// isUnique is derived from IndexMetadata rather than stored on the field
// entity; callers that need an accurate value (e.g. the REST controller)
// pass the precomputed Set<fieldMetadataId>. Callers in pure-entity
// contexts that don't care about uniqueness can omit it.
export const fromFieldMetadataEntityToFieldMetadataDto = (
  entity: FieldMetadataEntity,
  uniqueFieldMetadataIds?: ReadonlySet<string>,
): FieldMetadataDTO => ({
  id: entity.id,
  universalIdentifier: entity.universalIdentifier,
  applicationId: entity.applicationId,
  type: entity.type,
  name: entity.name,
  label: entity.label,
  description: entity.description ?? undefined,
  icon: entity.icon ?? undefined,
  standardOverrides: entity.standardOverrides ?? undefined,
  isActive: entity.isActive,
  isSystem: entity.isSystem,
  isUIEditable: entity.isUIEditable,
  isUIReadOnly: !entity.isUIEditable,
  isNullable: entity.isNullable ?? false,
  isUnique: uniqueFieldMetadataIds?.has(entity.id) ?? false,
  defaultValue: entity.defaultValue ?? undefined,
  options: entity.options ?? undefined,
  settings: entity.settings ?? undefined,
  workspaceId: entity.workspaceId,
  objectMetadataId: entity.objectMetadataId,
  isLabelSyncedWithName: entity.isLabelSyncedWithName,
  morphId: entity.morphId ?? undefined,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});
