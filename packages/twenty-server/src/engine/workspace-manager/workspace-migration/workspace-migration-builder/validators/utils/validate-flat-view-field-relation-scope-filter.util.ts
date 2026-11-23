import { msg, t } from '@lingui/core/macro';
import { type UniversalViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getIncompatibleViewFilterOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-view-filter-operand-error.util';
import { getInvalidFlatViewFieldRelationScopeError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-flat-view-field-relation-scope-error.util';
import { getInvalidViewFilterValueAndSelectOptionErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-value-and-select-option-errors.util';
import { resolveFlatViewFieldRelationScopeFieldReference } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-flat-view-field-relation-scope-field-reference.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

export const validateFlatViewFieldRelationScopeFilter = ({
  filter,
  filterIds,
  filterGroupIds,
  objectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: {
  filter: UniversalViewFieldRelationScope['filters'][number];
  filterIds: Set<string>;
  filterGroupIds: Set<string>;
  objectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (!isValidUuid(filter.id) || filterIds.has(filter.id)) {
    errors.push(
      getInvalidFlatViewFieldRelationScopeError({
        message: t`Relation scope filter ids must be unique UUIDs`,
        userFriendlyMessage: msg`Related records filters are invalid`,
      }),
    );
  }

  filterIds.add(filter.id);

  if (
    isDefined(filter.filterGroupId) &&
    !filterGroupIds.has(filter.filterGroupId)
  ) {
    errors.push(
      getInvalidFlatViewFieldRelationScopeError({
        message: t`Relation scope filter group not found`,
        userFriendlyMessage: msg`Related records filters are invalid`,
      }),
    );
  }

  const {
    errors: fieldReferenceErrors,
    flatFieldMetadata,
    relationTargetFlatFieldMetadata,
  } = resolveFlatViewFieldRelationScopeFieldReference({
    fieldReference: filter,
    objectMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });

  errors.push(...fieldReferenceErrors);

  if (!isDefined(flatFieldMetadata)) {
    return errors;
  }

  const filterOperandContext = {
    operand: filter.operand,
    fieldType: flatFieldMetadata.type,
    subFieldName: filter.subFieldName,
    relationTargetFieldType: relationTargetFlatFieldMetadata?.type,
  };

  const incompatibleOperandError =
    getIncompatibleViewFilterOperandError(filterOperandContext);

  if (isDefined(incompatibleOperandError)) {
    return [...errors, incompatibleOperandError];
  }

  return [
    ...errors,
    ...getInvalidViewFilterValueAndSelectOptionErrors({
      ...filterOperandContext,
      value: filter.value,
      selectOptionFlatFieldMetadata:
        relationTargetFlatFieldMetadata ?? flatFieldMetadata,
      flatFieldMetadataOptionMaps,
    }),
  ];
};
