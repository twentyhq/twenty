import { type DerivedFieldMetadataIds } from 'src/engine/metadata-modules/derived-field-metadata-ids/types/derived-field-metadata-ids.type';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

// A TypeORM entity carries no owner universal identifier: without it every
// entry ranks as a non-owner one, which is the custom application's here.
const resolveEffectiveEntityIsActive = (entity: {
  isActive: boolean;
  overrides: unknown;
}): boolean => {
  const overrideValue = readAuthoredOverrideProperty({
    overrides: entity.overrides,
    path: ['isActive'],
    authorContext: { ownerApplicationUniversalIdentifier: undefined },
  });

  return typeof overrideValue === 'boolean' ? overrideValue : entity.isActive;
};

// isUnique is derived from IndexMetadata rather than stored on the field
// entity; callers that need an accurate value (e.g. the REST controller)
// pass the precomputed Set<fieldMetadataId>. Callers in pure-entity
// contexts that don't care about uniqueness can omit it.

export const fromFieldMetadataEntityToFieldMetadataDto = (
  entity: FieldMetadataEntity,
  derivedFieldMetadataIds?: DerivedFieldMetadataIds,
): FieldMetadataDTO => ({
  id: entity.id,
  universalIdentifier: entity.universalIdentifier,
  applicationId: entity.applicationId,
  type: entity.type,
  name: entity.name,
  label: entity.label,
  description: entity.description ?? undefined,
  icon: entity.icon ?? undefined,
  overrides: entity.overrides ?? undefined,
  isActive: resolveEffectiveEntityIsActive(entity),
  isSystem: entity.isSystem,
  isUIEditable: entity.isUIEditable,
  isUIReadOnly: !entity.isUIEditable,
  writability: entity.writability,
  isNullable: entity.isNullable ?? false,
  isUnique:
    derivedFieldMetadataIds?.uniqueFieldMetadataIds.has(entity.id) ?? false,
  isSearchable:
    derivedFieldMetadataIds?.searchableFieldMetadataIds.has(entity.id) ?? false,
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
