import {
  FieldMetadataType,
  type RelationType,
  type RelationUpdatePayload,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { computeMorphRelationFlatFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-flat-field-name.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isMorphOrRelationFlatFieldMetadataWithTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata-with-target.util';
import { extractJunctionTargetSettingsFromSettings } from 'src/engine/metadata-modules/flat-field-metadata/utils/extract-junction-target-settings-from-settings.util';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

type ComputeFlatFieldToUpdateFromMorphRelationUpdatePayloadArgs = {
  flatApplication: FlatApplication;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphRelationsUpdatePayload?: RelationUpdatePayload[];
  fieldMetadataToUpdate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

type MorphDestinationTemplate = {
  morphName: string;
  relationType: RelationType;
  targetFieldLabel: string;
  targetFieldName: string | undefined;
  targetFieldIcon: string;
  junctionTargetFieldId: string | undefined;
};

const computeDestinationTemplateFromTarget = ({
  target,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  target: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> & {
    relationTargetFieldMetadataId: string;
    relationTargetObjectMetadataId: string;
  };
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): MorphDestinationTemplate => {
  const targetObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: target.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });
  const inverseFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: target.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  return {
    morphName: getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata: {
        name: target.name,
        universalSettings: target.universalSettings,
      },
      nameSingular: targetObjectMetadata.nameSingular,
      namePlural: targetObjectMetadata.namePlural,
    }),
    relationType: target.settings.relationType,
    targetFieldLabel: inverseFlatFieldMetadata.label,
    targetFieldName: inverseFlatFieldMetadata.name,
    targetFieldIcon: target.icon ?? 'Icon123',
    junctionTargetFieldId: extractJunctionTargetSettingsFromSettings(
      target.settings,
    ).junctionTargetFieldId,
  };
};

const computeDestinationTemplateFromHead = ({
  head,
  sourceObjectMetadata,
}: {
  head: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  sourceObjectMetadata: FlatObjectMetadata;
}): MorphDestinationTemplate => ({
  morphName: head.name,
  relationType: head.settings.relationType,
  targetFieldLabel:
    head.settings.targetFieldLabel ?? sourceObjectMetadata.labelPlural,
  targetFieldName: head.settings.targetFieldName,
  targetFieldIcon: head.settings.targetFieldIcon ?? head.icon ?? 'Icon123',
  junctionTargetFieldId: extractJunctionTargetSettingsFromSettings(
    head.settings,
  ).junctionTargetFieldId,
});

export const computeFlatFieldToUpdateFromMorphRelationUpdatePayload = ({
  flatApplication,
  flatFieldMetadataMaps,
  morphRelationsUpdatePayload,
  fieldMetadataToUpdate,
  flatObjectMetadataMaps,
}: ComputeFlatFieldToUpdateFromMorphRelationUpdatePayloadArgs): {
  flatFieldMetadatasToCreate: UniversalFlatFieldMetadata[];
  flatIndexMetadatasToCreate: UniversalFlatIndexMetadata[];
} => {
  const flatFieldMetadatasToCreate: UniversalFlatFieldMetadata[] = [];
  const flatIndexMetadatasToCreate: UniversalFlatIndexMetadata[] = [];

  if (!isDefined(morphRelationsUpdatePayload)) {
    return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
  }

  const sourceObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: fieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const morphRelationsCommonLabel = fieldMetadataToUpdate.label;

  const morphTargetToExtend = isMorphOrRelationFlatFieldMetadataWithTarget(
    fieldMetadataToUpdate,
  )
    ? fieldMetadataToUpdate
    : findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
        flatFieldMetadata: fieldMetadataToUpdate,
        flatFieldMetadataMaps,
        flatObjectMetadata: sourceObjectMetadata,
      }).find(isMorphOrRelationFlatFieldMetadataWithTarget);

  const {
    morphName,
    relationType,
    targetFieldLabel,
    targetFieldName,
    targetFieldIcon,
    junctionTargetFieldId,
  } = isDefined(morphTargetToExtend)
    ? computeDestinationTemplateFromTarget({
        target: morphTargetToExtend,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      })
    : computeDestinationTemplateFromHead({
        head: fieldMetadataToUpdate,
        sourceObjectMetadata,
      });

  const junctionTargetFlatFieldMetadata = isDefined(junctionTargetFieldId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: junctionTargetFieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  morphRelationsUpdatePayload.forEach((morphRelationUpdatePayload) => {
    const { targetObjectMetadataId } = morphRelationUpdatePayload;

    const newTargetObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const computedMorphName = computeMorphRelationFlatFieldName({
      fieldName: morphName,
      relationType,
      targetObjectMetadataNameSingular: newTargetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: newTargetObjectMetadata.namePlural,
    });

    const { flatFieldMetadatas, indexMetadatas } =
      generateMorphOrRelationFlatFieldMetadataPair({
        createFieldInput: {
          type: FieldMetadataType.MORPH_RELATION,
          name: computedMorphName,
          label: morphRelationsCommonLabel,
          relationCreationPayload: {
            type: relationType,
            targetObjectMetadataId,
            targetFieldLabel,
            targetFieldIcon,
          },
        },
        sourceFlatObjectMetadata: sourceObjectMetadata,
        targetFlatObjectMetadata: newTargetObjectMetadata,
        targetFlatFieldMetadataType: FieldMetadataType.RELATION,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        sourceFlatObjectMetadataJoinColumnName:
          computeMorphOrRelationFieldJoinColumnName({
            name: computedMorphName,
          }),
        morphId: fieldMetadataToUpdate.morphId,
        targetFieldName,
        junctionTargetFlatFieldMetadata,
      });

    flatFieldMetadatasToCreate.push(...flatFieldMetadatas);
    flatIndexMetadatasToCreate.push(...indexMetadatas);
  });

  return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
};
