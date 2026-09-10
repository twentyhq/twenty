import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

// A TypeORM entity carries no owner universal identifier: without it every
// entry ranks as a non-owner one, which is the custom application's here.
const resolveEffectiveEntityIsActive = (entity: {
  isActive: boolean;
  overrides: unknown;
}): boolean => {
  const overrideValue = readAuthoredOverrideProperty({
    metadataName: 'objectMetadata',
    overrides: entity.overrides,
    path: ['isActive'],
    authorContext: { ownerApplicationUniversalIdentifier: undefined },
  });

  return typeof overrideValue === 'boolean' ? overrideValue : entity.isActive;
};

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
  overrides: entity.overrides ?? undefined,
  isRemote: entity.isRemote,
  isActive: resolveEffectiveEntityIsActive(entity),
  isSystem: entity.isSystem,
  isUIEditable: entity.isUIEditable,
  isUICreatable: entity.isUICreatable,
  isUIReadOnly: !entity.isUIEditable,
  isSearchable: entity.isSearchable,
  openRecordIn: entity.openRecordIn,
  readability: entity.readability,
  writability: entity.writability,
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
