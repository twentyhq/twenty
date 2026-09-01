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
import { buildJunctionRelationTargetShape } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-junction-relation-target-shape.util';
import { buildRelationTargetJoinColumns } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-relation-target-join-columns.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const isOneToManyRelationField = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): flatFieldMetadata is OrmFlatFieldMetadata<FieldMetadataType.RELATION> =>
  flatFieldMetadata.type === FieldMetadataType.RELATION &&
  isFieldMetadataSettingsOfType(
    flatFieldMetadata.settings,
    FieldMetadataType.RELATION,
  ) &&
  flatFieldMetadata.settings.relationType === RelationType.ONE_TO_MANY;

const isManyToOneRelationOrMorphField = (
  flatFieldMetadata: OrmFlatFieldMetadata,
) => {
  const { type } = flatFieldMetadata;

  return (
    (type === FieldMetadataType.RELATION ||
      type === FieldMetadataType.MORPH_RELATION) &&
    isFieldMetadataSettingsOfType(flatFieldMetadata.settings, type) &&
    flatFieldMetadata.settings.relationType === RelationType.MANY_TO_ONE
  );
};

export const resolveJunctionRelationTargetShapeFromVisibleField = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: OrmFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): JunctionRelationTargetShape | undefined => {
  const owningShape = buildJunctionRelationTargetShape({
    relationFlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (isDefined(owningShape)) {
    return owningShape;
  }

  if (
    isOneToManyRelationField(relationFlatFieldMetadata) &&
    isDefined(relationFlatFieldMetadata.settings.junctionTargetFieldId)
  ) {
    return undefined;
  }

  if (
    !isOneToManyRelationField(relationFlatFieldMetadata) ||
    !isDefined(relationFlatFieldMetadata.relationTargetObjectMetadataId) ||
    !isDefined(relationFlatFieldMetadata.relationTargetFieldMetadataId)
  ) {
    return undefined;
  }

  const junctionFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFlatFieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });
  const visibleJunctionTargetFlatFieldMetadata =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationFlatFieldMetadata.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  if (
    !isDefined(junctionFlatObjectMetadata) ||
    !isDefined(visibleJunctionTargetFlatFieldMetadata) ||
    visibleJunctionTargetFlatFieldMetadata.objectMetadataId !==
      junctionFlatObjectMetadata.id ||
    !isManyToOneRelationOrMorphField(visibleJunctionTargetFlatFieldMetadata) ||
    !areFlatFieldMetadatasReciprocal({
      firstFlatFieldMetadata: relationFlatFieldMetadata,
      secondFlatFieldMetadata: visibleJunctionTargetFlatFieldMetadata,
    })
  ) {
    return undefined;
  }

  const declaredOwningFields = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((candidateFlatFieldMetadata) => {
      if (
        !isOneToManyRelationField(candidateFlatFieldMetadata) ||
        candidateFlatFieldMetadata.relationTargetObjectMetadataId !==
          junctionFlatObjectMetadata.id ||
        !isDefined(candidateFlatFieldMetadata.settings.junctionTargetFieldId)
      ) {
        return false;
      }

      const configuredTargetFlatFieldMetadata =
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId:
            candidateFlatFieldMetadata.settings.junctionTargetFieldId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

      return (
        isDefined(configuredTargetFlatFieldMetadata) &&
        areFlatFieldMetadatasInSameRelationGroup({
          firstFlatFieldMetadata: configuredTargetFlatFieldMetadata,
          secondFlatFieldMetadata: visibleJunctionTargetFlatFieldMetadata,
        })
      );
    });

  if (declaredOwningFields.length !== 1) {
    return undefined;
  }

  const owningFlatFieldMetadata = declaredOwningFields[0];
  const validatedOwningShape = buildJunctionRelationTargetShape({
    relationFlatFieldMetadata: owningFlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (
    !isDefined(validatedOwningShape) ||
    !isDefined(owningFlatFieldMetadata.relationTargetFieldMetadataId)
  ) {
    return undefined;
  }

  const junctionSourceFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: owningFlatFieldMetadata.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(junctionSourceFlatFieldMetadata)) {
    return undefined;
  }

  const targetJoinColumns = buildRelationTargetJoinColumns({
    targetFlatFieldMetadata: junctionSourceFlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (targetJoinColumns.length === 0) {
    return undefined;
  }

  return {
    ...validatedOwningShape,
    junctionSourceJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
      name: visibleJunctionTargetFlatFieldMetadata.name,
    }),
    isTargetMorphRelation:
      junctionSourceFlatFieldMetadata.type === FieldMetadataType.MORPH_RELATION,
    targetJoinColumns,
  };
};
