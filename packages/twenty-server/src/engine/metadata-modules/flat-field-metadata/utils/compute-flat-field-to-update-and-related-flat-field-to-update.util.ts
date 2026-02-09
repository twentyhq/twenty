import { FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FLAT_FIELD_METADATA_MORPH_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_RELATION_UPDATE_CONSTANT } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-morph-relation-editable-properties-on-sibling-morph-relation-update.constant';
import { FLAT_FIELD_METADATA_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_OR_RELATION_UPDATE_CONSTANT } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-editable-properties-on-sibling-morph-or-relation-update.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFlatFieldMetadatasRelatedToMorphRelationOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadatas-related-to-morph-relation-or-throw.util';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

type ComputeFlatFieldToUpdateAndRelatedFlatFieldToUpdateReturnType = {
  flatFieldMetadataFromTo: FromTo<FlatFieldMetadata, 'flatFieldMetadata'>;
  relatedFlatFieldMetadatasFromTo: FromTo<
    FlatFieldMetadata,
    'flatFieldMetadata'
  >[];
};

type ComputeFlatFieldToUpdateAndRelatedFlatFieldToUpdateArgs = {
  rawUpdateFieldInput: UpdateFieldInput;
  fromFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
  isSystemBuild: boolean;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;
// Note: Standard override is way too complex we should land a smoother implemenentation once we standardize
// them across every flat entities
export const computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate = ({
  fromFlatFieldMetadata,
  rawUpdateFieldInput,
  flatFieldMetadataMaps,
  flatObjectMetadata,
  isSystemBuild,
}: ComputeFlatFieldToUpdateAndRelatedFlatFieldToUpdateArgs): ComputeFlatFieldToUpdateAndRelatedFlatFieldToUpdateReturnType => {
  const { standardOverrides, updatedEditableFieldProperties } =
    sanitizeRawUpdateFieldInput({
      existingFlatFieldMetadata: fromFlatFieldMetadata,
      rawUpdateFieldInput,
      isSystemBuild,
    });

  const isStandardField = belongsToTwentyStandardApp(fromFlatFieldMetadata);

  const toFlatFieldMetadata = {
    ...mergeUpdateInExistingRecord({
      existing: fromFlatFieldMetadata,
      properties:
        FLAT_FIELD_METADATA_EDITABLE_PROPERTIES[
          isStandardField && !isSystemBuild ? 'standard' : 'custom'
        ],
      update: updatedEditableFieldProperties,
    }),
    standardOverrides,
  };

  if (updatedEditableFieldProperties.settings !== undefined) {
    const updatedSettings = toFlatFieldMetadata.settings;

    const isRelationSettings =
      isFieldMetadataSettingsOfType(
        updatedSettings,
        FieldMetadataType.RELATION,
      ) ||
      isFieldMetadataSettingsOfType(
        updatedSettings,
        FieldMetadataType.MORPH_RELATION,
      );

    if (
      isRelationSettings &&
      isDefined(updatedSettings?.junctionTargetFieldId)
    ) {
      const junctionFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: updatedSettings.junctionTargetFieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(junctionFlatFieldMetadata)) {
        throw new FlatEntityMapsException(
          `Field metadata universal identifier not found for id: ${updatedSettings.junctionTargetFieldId}`,
          FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
        );
      }

      toFlatFieldMetadata.universalSettings = {
        ...updatedSettings,
        junctionTargetFieldUniversalIdentifier:
          junctionFlatFieldMetadata.universalIdentifier,
      };
    } else {
      toFlatFieldMetadata.universalSettings = updatedSettings;
    }
  }

  if (
    isFlatFieldMetadataOfType(fromFlatFieldMetadata, FieldMetadataType.RELATION)
  ) {
    const relatedFlatFieldMetadataFrom =
      findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
        flatFieldMetadata: fromFlatFieldMetadata,
        flatFieldMetadataMaps,
      });

    const relatedFlatFieldMetadataTo = mergeUpdateInExistingRecord({
      existing: relatedFlatFieldMetadataFrom as FlatFieldMetadata,
      properties:
        FLAT_FIELD_METADATA_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_OR_RELATION_UPDATE_CONSTANT,
      update: updatedEditableFieldProperties,
    });

    return {
      flatFieldMetadataFromTo: {
        fromFlatFieldMetadata,
        toFlatFieldMetadata,
      },
      relatedFlatFieldMetadatasFromTo: [
        {
          fromFlatFieldMetadata: relatedFlatFieldMetadataFrom,
          toFlatFieldMetadata: relatedFlatFieldMetadataTo,
        },
      ],
    };
  }

  if (
    isFlatFieldMetadataOfType(
      fromFlatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    const { morphRelationFlatFieldMetadatas, relationFlatFieldMetadatas } =
      findFlatFieldMetadatasRelatedToMorphRelationOrThrow({
        flatFieldMetadata: fromFlatFieldMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadata,
      });

    const relatedMorphRelationFlatFieldMetdataTo =
      morphRelationFlatFieldMetadatas.map<
        FromTo<FlatFieldMetadata, 'flatFieldMetadata'>
      >((relatedFlatFieldMetadataFrom) => {
        const relatedMorphPropertiesToUpdateTo =
          FLAT_FIELD_METADATA_MORPH_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_RELATION_UPDATE_CONSTANT[
            isStandardField && !isSystemBuild ? 'standard' : 'custom'
          ];
        const relatedFlatFieldMetadataTo = {
          ...mergeUpdateInExistingRecord({
            existing: relatedFlatFieldMetadataFrom as FlatFieldMetadata,
            properties: relatedMorphPropertiesToUpdateTo,
            update: updatedEditableFieldProperties,
          }),
          standardOverrides,
        };

        return {
          fromFlatFieldMetadata: relatedFlatFieldMetadataFrom,
          toFlatFieldMetadata: relatedFlatFieldMetadataTo,
        };
      });

    const relatedRelationFlatFieldMetadataTo = relationFlatFieldMetadatas.map<
      FromTo<FlatFieldMetadata, 'flatFieldMetadata'>
    >((relatedFlatFieldMetadataFrom) => {
      const relatedFlatFieldMetadataTo = mergeUpdateInExistingRecord({
        existing: relatedFlatFieldMetadataFrom as FlatFieldMetadata,
        properties:
          FLAT_FIELD_METADATA_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_OR_RELATION_UPDATE_CONSTANT,
        update: updatedEditableFieldProperties,
      });

      return {
        fromFlatFieldMetadata: relatedFlatFieldMetadataFrom,
        toFlatFieldMetadata: relatedFlatFieldMetadataTo,
      };
    });

    return {
      flatFieldMetadataFromTo: {
        fromFlatFieldMetadata,
        toFlatFieldMetadata,
      },
      relatedFlatFieldMetadatasFromTo: [
        ...relatedMorphRelationFlatFieldMetdataTo,
        ...relatedRelationFlatFieldMetadataTo,
      ],
    };
  }

  return {
    flatFieldMetadataFromTo: {
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
    },
    relatedFlatFieldMetadatasFromTo: [],
  };
};
