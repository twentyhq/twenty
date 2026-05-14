import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fromFieldMetadataEntityToFieldMetadataDto = (
  entity: FieldMetadataEntity,
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
  isCustom: entity.isCustom,
  isActive: entity.isActive,
  isSystem: entity.isSystem,
  isUIReadOnly: entity.isUIReadOnly,
  isNullable: entity.isNullable ?? false,
  isUnique: entity.isUnique ?? false,
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
