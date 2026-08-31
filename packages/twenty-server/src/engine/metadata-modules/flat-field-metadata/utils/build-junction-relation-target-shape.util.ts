import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type JunctionRelationTargetShape } from 'src/engine/metadata-modules/flat-field-metadata/types/junction-relation-target-shape.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { areFlatFieldMetadatasInSameRelationGroup } from 'src/engine/metadata-modules/flat-field-metadata/utils/are-flat-field-metadatas-in-same-relation-group.util';
import { buildRelationTargetJoinColumns } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-relation-target-join-columns.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildJunctionRelationTargetShape = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: OrmFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): JunctionRelationTargetShape | undefined => {
  const { settings } = relationFlatFieldMetadata;

  if (
    relationFlatFieldMetadata.type !== FieldMetadataType.RELATION ||
    !isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION) ||
    settings.relationType !== RelationType.ONE_TO_MANY ||
    !isDefined(settings.junctionTargetFieldId) ||
    !isDefined(relationFlatFieldMetadata.relationTargetObjectMetadataId) ||
    !isDefined(relationFlatFieldMetadata.relationTargetFieldMetadataId)
  ) {
    return undefined;
  }

  const junctionFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFlatFieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });
  const junctionSourceFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFlatFieldMetadata.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const junctionTargetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: settings.junctionTargetFieldId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(junctionFlatObjectMetadata) ||
    !isDefined(junctionSourceFlatFieldMetadata) ||
    !isDefined(junctionTargetFlatFieldMetadata) ||
    junctionSourceFlatFieldMetadata.objectMetadataId !==
      junctionFlatObjectMetadata.id ||
    junctionTargetFlatFieldMetadata.objectMetadataId !==
      junctionFlatObjectMetadata.id ||
    junctionSourceFlatFieldMetadata.relationTargetObjectMetadataId !==
      relationFlatFieldMetadata.objectMetadataId ||
    junctionSourceFlatFieldMetadata.relationTargetFieldMetadataId !==
      relationFlatFieldMetadata.id ||
    areFlatFieldMetadatasInSameRelationGroup({
      firstFlatFieldMetadata: junctionSourceFlatFieldMetadata,
      secondFlatFieldMetadata: junctionTargetFlatFieldMetadata,
    })
  ) {
    return undefined;
  }

  const sourceFieldType = junctionSourceFlatFieldMetadata.type;

  if (
    (sourceFieldType !== FieldMetadataType.RELATION &&
      sourceFieldType !== FieldMetadataType.MORPH_RELATION) ||
    !isFieldMetadataSettingsOfType(
      junctionSourceFlatFieldMetadata.settings,
      sourceFieldType,
    ) ||
    junctionSourceFlatFieldMetadata.settings.relationType !==
      RelationType.MANY_TO_ONE
  ) {
    return undefined;
  }

  const targetJoinColumns = buildRelationTargetJoinColumns({
    targetFlatFieldMetadata: junctionTargetFlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  return targetJoinColumns.length === 0
    ? undefined
    : {
        kind: 'JUNCTION',
        junctionObjectMetadataId: junctionFlatObjectMetadata.id,
        junctionObjectNameSingular: junctionFlatObjectMetadata.nameSingular,
        junctionSourceJoinColumnName: getJoinColumnNameForRelationField(
          junctionSourceFlatFieldMetadata,
        ),
        targetJoinColumns,
      };
};
