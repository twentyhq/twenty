import { FieldMetadataType } from 'twenty-shared/types';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { getInvalidViewFilterSelectOptionError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-select-option-error.util';
import { isFlatFieldMetadataOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';

type UniversalRelationScope = NonNullable<
  UniversalFlatViewField['universalRelationScope']
>;

type SelectOptionMaps = {
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
};

const isFilterUsingMissingSelectOption = ({
  filter,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: SelectOptionMaps & {
  filter: UniversalRelationScope['filters'][number];
}): boolean => {
  const referencedFieldMetadataUniversalIdentifier =
    filter.relationTargetFieldMetadataUniversalIdentifier ??
    filter.fieldMetadataUniversalIdentifier;

  if (!isDefined(referencedFieldMetadataUniversalIdentifier)) {
    return false;
  }

  const referencedFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: referencedFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(referencedFlatFieldMetadata) ||
    !isFlatFieldMetadataOfTypes(referencedFlatFieldMetadata, [
      FieldMetadataType.SELECT,
      FieldMetadataType.MULTI_SELECT,
    ])
  ) {
    return false;
  }

  return isDefined(
    getInvalidViewFilterSelectOptionError({
      referencedFieldMetadata: referencedFlatFieldMetadata,
      flatFieldMetadataOptionMaps,
      operand: filter.operand,
      value: filter.value,
    }),
  );
};

export const isFlatViewFieldRelationScopeSelectOptionMaintenance = ({
  existingUniversalRelationScope,
  updatedUniversalRelationScope,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: SelectOptionMaps & {
  existingUniversalRelationScope: UniversalFlatViewField['universalRelationScope'];
  updatedUniversalRelationScope: UniversalFlatViewField['universalRelationScope'];
}): boolean => {
  if (
    !isDefined(existingUniversalRelationScope) ||
    !isDefined(updatedUniversalRelationScope)
  ) {
    return false;
  }

  const { filters: existingFilters, ...existingScopeWithoutFilters } =
    existingUniversalRelationScope;
  const { filters: updatedFilters, ...updatedScopeWithoutFilters } =
    updatedUniversalRelationScope;

  const existingFilterIds = new Set(existingFilters.map(({ id }) => id));

  if (
    !fastDeepEqual(existingScopeWithoutFilters, updatedScopeWithoutFilters) ||
    updatedFilters.some(({ id }) => !existingFilterIds.has(id))
  ) {
    return false;
  }

  const updatedFilterById = new Map(
    updatedFilters.map((filter) => [filter.id, filter]),
  );

  return existingFilters.every((existingFilter) => {
    const updatedFilter = updatedFilterById.get(existingFilter.id);

    if (fastDeepEqual(existingFilter, updatedFilter)) {
      return true;
    }

    const isOnlyValueChanged =
      !isDefined(updatedFilter) ||
      fastDeepEqual(
        { ...existingFilter, value: undefined },
        { ...updatedFilter, value: undefined },
      );

    return (
      isOnlyValueChanged &&
      isFilterUsingMissingSelectOption({
        filter: existingFilter,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      })
    );
  });
};
