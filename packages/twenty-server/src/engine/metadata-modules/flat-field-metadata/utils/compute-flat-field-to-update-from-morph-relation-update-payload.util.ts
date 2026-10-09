import {
  FieldMetadataType,
  type RelationUpdatePayload,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { computeMorphRelationFlatFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-flat-field-name.util';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { extractJunctionTargetSettingsFromSettings } from 'src/engine/metadata-modules/flat-field-metadata/utils/extract-junction-target-settings-from-settings.util';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

type ComputeFlatFieldToUpdateFromMorphRelationUpdatePayloadArgs = {
  flatApplication: FlatApplication;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphRelationsUpdatePayload?: RelationUpdatePayload[];
  fieldMetadataToUpdate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

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

  const commonTargetFieldLabel =
    fieldMetadataToUpdate.settings.targetFieldLabel ??
    sourceObjectMetadata.labelPlural;
  const commonTargetFieldName = fieldMetadataToUpdate.settings.targetFieldName;

  const { junctionTargetFieldId } = extractJunctionTargetSettingsFromSettings(
    fieldMetadataToUpdate.settings,
  );
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
      fieldName: fieldMetadataToUpdate.name,
      relationType: fieldMetadataToUpdate.settings.relationType,
      targetObjectMetadataNameSingular: newTargetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: newTargetObjectMetadata.namePlural,
    });

    const { flatFieldMetadatas, indexMetadatas } =
      generateMorphOrRelationFlatFieldMetadataPair({
        createFieldInput: {
          type: FieldMetadataType.MORPH_RELATION,
          name: computedMorphName,
          label: morphRelationsCommonLabel,
          icon: fieldMetadataToUpdate.icon ?? undefined,
          description: fieldMetadataToUpdate.description ?? undefined,
          isActive: resolveEffectiveFlatEntityProperty({
            metadataName: 'fieldMetadata',
            flatEntity: fieldMetadataToUpdate,
            property: 'isActive',
          }),
          relationCreationPayload: {
            type: fieldMetadataToUpdate.settings.relationType,
            targetObjectMetadataId,
            targetFieldLabel: commonTargetFieldLabel,
            targetFieldIcon:
              fieldMetadataToUpdate.settings.targetFieldIcon ??
              sourceObjectMetadata.icon ??
              'Icon123',
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
        targetFieldName: commonTargetFieldName,
        junctionTargetFlatFieldMetadata,
      });

    for (const field of flatFieldMetadatas) {
      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(fieldMetadataToUpdate.settings.onDelete)
      ) {
        field.universalSettings = {
          ...field.universalSettings,
          relationType: fieldMetadataToUpdate.settings.relationType,
          onDelete: fieldMetadataToUpdate.settings.onDelete,
        };
      }
    }
    flatFieldMetadatasToCreate.push(...flatFieldMetadatas);
    flatIndexMetadatasToCreate.push(...indexMetadatas);
  });

  return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
};
