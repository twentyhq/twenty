import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type JunctionRelationTargetShape } from 'src/engine/metadata-modules/flat-field-metadata/types/junction-relation-target-shape.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { areFlatFieldMetadatasInSameRelationGroup } from 'src/engine/metadata-modules/flat-field-metadata/utils/are-flat-field-metadatas-in-same-relation-group.util';
import { areFlatFieldMetadatasReciprocal } from 'src/engine/metadata-modules/flat-field-metadata/utils/are-flat-field-metadatas-reciprocal.util';
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
  const junctionTargetInverseFlatFieldMetadata = isDefined(
    junctionTargetFlatFieldMetadata?.relationTargetFieldMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          junctionTargetFlatFieldMetadata.relationTargetFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (
    !isDefined(junctionFlatObjectMetadata) ||
    !isDefined(junctionSourceFlatFieldMetadata) ||
    !isDefined(junctionTargetFlatFieldMetadata) ||
    !isDefined(junctionTargetInverseFlatFieldMetadata) ||
    junctionSourceFlatFieldMetadata.objectMetadataId !==
      junctionFlatObjectMetadata.id ||
    junctionTargetFlatFieldMetadata.objectMetadataId !==
      junctionFlatObjectMetadata.id ||
    !areFlatFieldMetadatasReciprocal({
      firstFlatFieldMetadata: relationFlatFieldMetadata,
      secondFlatFieldMetadata: junctionSourceFlatFieldMetadata,
    }) ||
    junctionTargetInverseFlatFieldMetadata.type !==
      FieldMetadataType.RELATION ||
    !isFieldMetadataSettingsOfType(
      junctionTargetInverseFlatFieldMetadata.settings,
      FieldMetadataType.RELATION,
    ) ||
    junctionTargetInverseFlatFieldMetadata.settings.relationType !==
      RelationType.ONE_TO_MANY ||
    !areFlatFieldMetadatasReciprocal({
      firstFlatFieldMetadata: junctionTargetFlatFieldMetadata,
      secondFlatFieldMetadata: junctionTargetInverseFlatFieldMetadata,
    }) ||
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

  if (targetJoinColumns.length === 0) {
    return undefined;
  }

  return {
    kind: 'JUNCTION',
    junctionObjectMetadataId: junctionFlatObjectMetadata.id,
    junctionObjectNameSingular: junctionFlatObjectMetadata.nameSingular,
    junctionSourceJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
      name: junctionSourceFlatFieldMetadata.name,
    }),
    isTargetMorphRelation:
      junctionTargetFlatFieldMetadata.type ===
      FieldMetadataType.MORPH_RELATION,
    targetJoinColumns,
  };
};
