import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import {
  FlatViewFiltersToDeleteAndUpdate,
  recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-filters-on-flat-field-metadata-options-update.util';
import {
  FlatViewGroupsToDeleteUpdateAndCreate,
  recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-groups-on-flat-field-metadata-options-update.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
import { EnumFieldMetadataType } from 'twenty-shared/types';
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
} & FlatViewFiltersToDeleteAndUpdate &
  FlatViewGroupsToDeleteUpdateAndCreate;

type HandleFlatFieldMetadataUpdateSideEffectArgs = {
  updatedEditableFieldProperties: SanitizedUpdateFieldInput;
  fromFlatFieldMetadata: FlatFieldMetadata;
} & Pick<
  AllFlatEntityMaps,
  | 'flatIndexMaps'
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatViewFilterMaps'
  | 'flatViewGroupMaps'
>;

type UpdatedFlatFieldMetadataAndRelatedEntities =
  FlatFieldMetadataRelatedEntities & {
    flatFieldMetadata: FlatFieldMetadata;
  };
export const handleFlatFieldMetadataUpdateSideEffect = ({
  updatedEditableFieldProperties,
  fromFlatFieldMetadata: initialFromFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatIndexMaps,
  flatFieldMetadataMaps,
  flatViewFilterMaps,
  flatViewGroupMaps,
}: HandleFlatFieldMetadataUpdateSideEffectArgs) => {
  const initialAccumulator: UpdatedFlatFieldMetadataAndRelatedEntities = {
    flatFieldMetadata: structuredClone(initialFromFlatFieldMetadata),
    flatViewFiltersToUpdate: [],
    flatIndexMetadatasToUpdate: [],
    flatViewFiltersToDelete: [],
    flatViewGroupsToCreate: [],
    flatViewGroupsToDelete: [],
    flatViewGroupsToUpdate: [],
  };
  return FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.reduce<UpdatedFlatFieldMetadataAndRelatedEntities>(
    (accumulator, property) => {
      const updatedPropertyValue = updatedEditableFieldProperties[property];
      const isPropertyUpdated =
        updatedPropertyValue !== undefined &&
        accumulator.flatFieldMetadata[property] !== updatedPropertyValue;

      if (!isPropertyUpdated) {
        return accumulator;
      }
      const updatedFlatFieldMetadata = {
        ...accumulator.flatFieldMetadata,
        [property]: updatedPropertyValue,
      };

      const sideEffectResult: UpdatedFlatFieldMetadataAndRelatedEntities = {
        flatIndexMetadatasToUpdate: [],
        flatFieldMetadata: accumulator.flatFieldMetadata,
        flatViewFiltersToDelete: [],
        flatViewFiltersToUpdate: [],
        flatViewGroupsToCreate: [],
        flatViewGroupsToDelete: [],
        flatViewGroupsToUpdate: [],
      };
      // Note: Not really comparing options integrity here, will be improved once side effects are handled within the builder
      if (
        property === 'options' &&
        isEnumFlatFieldMetadata(accumulator.flatFieldMetadata)
      ) {
        updatedFlatFieldMetadata.options =
          updatedEditableFieldProperties[property]?.map((option) => ({
            id: v4(),
            ...option,
          })) ?? [];

        const optionsPropertyUpdate: PropertyUpdate<
          FlatFieldMetadata<EnumFieldMetadataType>,
          'options'
        > = {
          from: accumulator.flatFieldMetadata.options,
          property,
          to: updatedFlatFieldMetadata.options,
        };

        const { flatViewFiltersToDelete, flatViewFiltersToUpdate } =
          recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate({
            flatViewFilterMaps,
            fromFlatFieldMetadata: accumulator.flatFieldMetadata,
            update: optionsPropertyUpdate,
          });

        const {
          flatViewGroupsToCreate,
          flatViewGroupsToDelete,
          flatViewGroupsToUpdate,
        } = recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate({
          flatViewGroupMaps,
          fromFlatFieldMetadata: accumulator.flatFieldMetadata,
          update: optionsPropertyUpdate,
        });
        sideEffectResult.flatViewFiltersToDelete.push(
          ...flatViewFiltersToDelete,
        );
        sideEffectResult.flatViewFiltersToUpdate.push(
          ...flatViewFiltersToUpdate,
        );

        sideEffectResult.flatViewGroupsToCreate.push(...flatViewGroupsToCreate);
        sideEffectResult.flatViewGroupsToDelete.push(...flatViewGroupsToDelete);
        sideEffectResult.flatViewGroupsToUpdate.push(...flatViewGroupsToUpdate);
      }

      if (property === 'name') {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: accumulator.flatFieldMetadata.objectMetadataId,
        });

        sideEffectResult.flatIndexMetadatasToUpdate.push(
          ...recomputeIndexOnFlatFieldMetadataNameUpdate({
            flatFieldMetadataMaps,
            flatObjectMetadata,
            fromFlatFieldMetadata: accumulator.flatFieldMetadata,
            toFlatFieldMetadata: {
              name: updatedFlatFieldMetadata.name,
            },
            flatIndexMaps,
          }),
        );
      }

      return {
        flatFieldMetadata: updatedFlatFieldMetadata,
        // TODO prastoin refactor this verbosity once moving side effect business core within builder
        flatIndexMetadatasToUpdate: [
          ...accumulator.flatIndexMetadatasToUpdate,
          ...sideEffectResult.flatIndexMetadatasToUpdate,
        ],
        flatViewFiltersToDelete: [
          ...accumulator.flatViewFiltersToDelete,
          ...sideEffectResult.flatViewFiltersToDelete,
        ],
        flatViewFiltersToUpdate: [
          ...accumulator.flatViewFiltersToUpdate,
          ...sideEffectResult.flatViewFiltersToUpdate,
        ],
        flatViewGroupsToCreate: [
          ...accumulator.flatViewGroupsToCreate,
          ...sideEffectResult.flatViewGroupsToCreate,
        ],
        flatViewGroupsToDelete: [
          ...accumulator.flatViewGroupsToDelete,
          ...sideEffectResult.flatViewGroupsToDelete,
        ],
        flatViewGroupsToUpdate: [
          ...accumulator.flatViewGroupsToUpdate,
          ...sideEffectResult.flatViewGroupsToUpdate,
        ],
      } satisfies UpdatedFlatFieldMetadataAndRelatedEntities;
    },
    initialAccumulator,
  );
};
