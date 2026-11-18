import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
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

export const addTimelineActivityObjectColumnsToSelect = <
  TSelection extends CommonSelection,
>({
  selection,
  flatObjectMetadata,
  recordReadRestrictions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  selection: TSelection;
  flatObjectMetadata: FlatObjectMetadata;
  recordReadRestrictions: Pick<
    RecordReadRestrictions,
    'unreadableFieldMetadataIds'
  >;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TSelection => {
  const columns = { ...selection.columns };
  const relations = { ...selection.relations };

  if (
    flatObjectMetadata.nameSingular === 'timelineActivity' &&
    isDefined(selection.columns.properties)
  ) {
    for (const columnName of resolveTimelineActivityObjectColumnNames({
      flatObjectMetadata,
      recordReadRestrictions,
      flatFieldMetadataMaps,
    })) {
      columns[columnName] = true;
    }
  }

  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  for (const { key, relationSelection } of getRelationSelectionEntries(
    selection,
  )) {
    const relationTargetObjectMetadataId = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldIdByName[relationSelection.fieldName],
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

    relations[key] = {
      ...relationSelection,
      selection: addTimelineActivityObjectColumnsToSelect({
        selection: relationSelection.selection,
        flatObjectMetadata: targetFlatObjectMetadata,
        recordReadRestrictions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    };
  }

  return { ...selection, columns, relations };
};
