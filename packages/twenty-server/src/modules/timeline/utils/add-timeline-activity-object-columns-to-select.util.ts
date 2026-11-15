import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { getRecordFieldEntries } from 'src/engine/api/common/utils/get-record-field-entries.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

const resolveTimelineActivityObjectColumnNames = ({
  flatObjectMetadata,
  recordReadRestrictions,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>;
  recordReadRestrictions: Pick<
    RecordReadRestrictions,
    'unreadableFieldMetadataIds'
  >;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string[] => {
  return flatObjectMetadata.fieldIds.flatMap((fieldId) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      recordReadRestrictions.unreadableFieldMetadataIds.has(fieldId)
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
  recordReadRestrictions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  select: CommonSelectedFields;
  flatObjectMetadata: FlatObjectMetadata;
  recordReadRestrictions: Pick<
    RecordReadRestrictions,
    'unreadableFieldMetadataIds'
  >;
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
      recordReadRestrictions,
      flatFieldMetadataMaps,
    })) {
      extendedSelect[columnName] = true;
    }
  }

  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  for (const {
    recordKey,
    fieldName,
    value: relationSelect,
  } of getRecordFieldEntries(select)) {
    const fieldId = fieldIdByName[fieldName];

    if (!isDefined(fieldId) || typeof relationSelect !== 'object') {
      continue;
    }

    const relationTargetObjectMetadataId = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    })?.relationTargetObjectMetadataId;

    if (!isDefined(relationTargetObjectMetadataId)) {
      continue;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      continue;
    }

    extendedSelect[recordKey] = addTimelineActivityObjectColumnsToSelect({
      select: relationSelect,
      flatObjectMetadata: targetFlatObjectMetadata,
      recordReadRestrictions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  return extendedSelect;
};
