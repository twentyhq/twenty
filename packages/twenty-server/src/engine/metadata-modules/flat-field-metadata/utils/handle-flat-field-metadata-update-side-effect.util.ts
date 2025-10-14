import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type SanitizedUpdateFieldInput = ReturnType<
  typeof extractAndSanitizeObjectStringFields<
    UpdateFieldInput,
    FlatFieldMetadataEditableProperties[]
  >
>;

export type FlatFieldMetadataRelatedEntities = {
  flatIndexMetadatasToUpdate: FlatIndexMetadata[];
  flatViewFilterToDelete: FlatViewFilter[];
  flatViewFilterToUpdate: FlatViewFilter[];
};

type HandleFlatFieldMetadataUpdateSideEffectArgs = {
  updatedEditableFieldProperties: SanitizedUpdateFieldInput;
  fromFlatFieldMetadata: FlatFieldMetadata;
} & Pick<
  AllFlatEntityMaps,
  'flatIndexMaps' | 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>;

type UpdatedFlatFieldMetadataAndRelatedEntities =
  FlatFieldMetadataRelatedEntities & {
    flatFieldMetadata: FlatFieldMetadata;
  };
export const handleFlatFieldMetadataUpdateSideEffect = ({
  updatedEditableFieldProperties,
  fromFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatIndexMaps,
  flatFieldMetadataMaps,
}: HandleFlatFieldMetadataUpdateSideEffectArgs) => {
  return FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.reduce<UpdatedFlatFieldMetadataAndRelatedEntities>(
    (
      {
        flatFieldMetadata,
        flatIndexMetadatasToUpdate,
        flatViewFilterToDelete,
        flatViewFilterToUpdate,
      },
      property,
    ) => {
      const updatedPropertyValue = updatedEditableFieldProperties[property];
      const isPropertyUpdated =
        updatedPropertyValue !== undefined &&
        flatFieldMetadata[property] !== updatedPropertyValue;

      if (!isPropertyUpdated) {
        return {
          flatFieldMetadata,
          flatIndexMetadatasToUpdate,
          flatViewFilterToDelete,
          flatViewFilterToUpdate,
        } satisfies UpdatedFlatFieldMetadataAndRelatedEntities;
      }
      const updatedFlatFieldMetadata = {
        ...flatFieldMetadata,
        [property]: updatedPropertyValue,
      };

      if (property === 'options') {
        updatedFlatFieldMetadata.options =
          updatedEditableFieldProperties[property]?.map((option) => ({
            id: v4(),
            ...option,
          })) ?? [];
      }

      let newFlatIndexMetadataToUpdate: FlatIndexMetadata[] = [];

      if (property === 'name') {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: flatFieldMetadata.objectMetadataId,
        });

        newFlatIndexMetadataToUpdate =
          recomputeIndexOnFlatFieldMetadataNameUpdate({
            flatFieldMetadataMaps,
            flatObjectMetadata,
            fromFlatFieldMetadata,
            toFlatFieldMetadata: {
              name: updatedFlatFieldMetadata.name,
            },
            flatIndexMaps,
          });
      }

      return {
        flatFieldMetadata: updatedFlatFieldMetadata,
        flatIndexMetadatasToUpdate: [
          ...flatIndexMetadatasToUpdate,
          ...newFlatIndexMetadataToUpdate,
        ],
        flatViewFilterToDelete,
        flatViewFilterToUpdate,
      } satisfies UpdatedFlatFieldMetadataAndRelatedEntities;
    },
    {
      flatFieldMetadata: structuredClone(fromFlatFieldMetadata),
      flatViewFilterToUpdate: [],
      flatIndexMetadatasToUpdate: [],
      flatViewFilterToDelete: [],
    } satisfies UpdatedFlatFieldMetadataAndRelatedEntities,
  );
};
