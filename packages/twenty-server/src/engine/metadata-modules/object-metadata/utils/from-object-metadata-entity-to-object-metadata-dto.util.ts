import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fromObjectMetadataEntityToObjectMetadataDto = (
  entity: ObjectMetadataEntity,
): ObjectMetadataDTO => ({
  id: entity.id,
  universalIdentifier: entity.universalIdentifier,
  applicationId: entity.applicationId,
  nameSingular: entity.nameSingular,
  namePlural: entity.namePlural,
  labelSingular: entity.labelSingular,
  labelPlural: entity.labelPlural,
  description: entity.description ?? undefined,
  icon: entity.icon ?? undefined,
  color: entity.color ?? undefined,
  shortcut: entity.shortcut ?? undefined,
  standardOverrides: entity.standardOverrides ?? undefined,
  isCustom: entity.isCustom,
  isRemote: entity.isRemote,
  isActive: entity.isActive,
  isSystem: entity.isSystem,
  isUIReadOnly: entity.isUIReadOnly,
  isSearchable: entity.isSearchable,
  isLabelSyncedWithName: entity.isLabelSyncedWithName,
  workspaceId: entity.workspaceId,
  labelIdentifierFieldMetadataId:
    entity.labelIdentifierFieldMetadataId ?? undefined,
  imageIdentifierFieldMetadataId:
    entity.imageIdentifierFieldMetadataId ?? undefined,
  duplicateCriteria: entity.duplicateCriteria ?? undefined,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});
