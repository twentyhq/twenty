import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const resolveTimelineActivityObjectColumnNames = ({
  flatObjectMetadata,
  recordsPermissions,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'fieldIds'>;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string[] => {
  const restrictedFields =
    recordsPermissions.objects[flatObjectMetadata.id]?.restrictedFields ?? {};

  return flatObjectMetadata.fieldIds.flatMap((fieldId) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      restrictedFields[fieldId]?.canRead === false
    ) {
      return [];
    }

    if (flatFieldMetadata.name === 'linkedObjectMetadataId') {
      return [flatFieldMetadata.name];
    }

    if (
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      isMorphRelationHead(flatFieldMetadata) ||
      flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
    ) {
      return [];
    }

    return [
      computeMorphOrRelationFieldJoinColumnName({
        name: flatFieldMetadata.name,
      }),
    ];
  });
};

export const addTimelineActivityObjectColumnsToSelect = ({
  select,
  flatObjectMetadata,
  recordsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  select: CommonSelectedFields;
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'id' | 'nameSingular' | 'fieldIds'
  >;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): CommonSelectedFields => {
  const extendedSelect: CommonSelectedFields = { ...select };

  if (
    flatObjectMetadata.nameSingular === 'timelineActivity' &&
    isDefined(select.properties)
  ) {
    for (const columnName of resolveTimelineActivityObjectColumnNames({
      flatObjectMetadata,
      recordsPermissions,
      flatFieldMetadataMaps,
    })) {
      extendedSelect[columnName] = true;
    }
  }

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    const relationSelect = isDefined(flatFieldMetadata)
      ? select[flatFieldMetadata.name]
      : undefined;

    if (
      !isDefined(flatFieldMetadata?.relationTargetObjectMetadataId) ||
      typeof relationSelect !== 'object'
    ) {
      continue;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      continue;
    }

    extendedSelect[flatFieldMetadata.name] =
      addTimelineActivityObjectColumnsToSelect({
        select: relationSelect,
        flatObjectMetadata: targetFlatObjectMetadata,
        recordsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
  }

  return extendedSelect;
};
