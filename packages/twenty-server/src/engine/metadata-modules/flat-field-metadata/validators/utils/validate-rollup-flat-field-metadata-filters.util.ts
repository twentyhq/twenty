import { msg } from '@lingui/core/macro';
import { getFieldMetadataValueType, isDefined } from 'twenty-shared/utils';

import { ROLLUP_FILTERABLE_FIELD_METADATA_TYPES } from 'src/engine/metadata-modules/flat-field-metadata/constants/rollup-filterable-field-metadata-types.constant';
import { ROLLUP_TIME_DEPENDENT_FILTER_OPERANDS } from 'src/engine/metadata-modules/flat-field-metadata/constants/rollup-time-dependent-filter-operands.constant';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { toRollupFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/to-rollup-field-metadata-validation-error.util';
import { type UniversalRollupSettings } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-rollup-settings.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { getIncompatibleViewFilterOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-view-filter-operand-error.util';
import { getInvalidViewFilterValueError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-value-error.util';
import { resolveFlatViewFieldRelationScopeFieldReference } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-flat-view-field-relation-scope-field-reference.util';
import { validateFlatViewFieldRelationScopeFilterGroups } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope-filter-groups.util';

const validateRollupFilter = ({
  filter,
  filterGroupIds,
  childObjectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  filter: UniversalRollupSettings['filters'][number];
  filterGroupIds: Set<string>;
  childObjectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatFieldMetadataValidationError[] => {
  if (isDefined(filter.relationTargetFieldMetadataUniversalIdentifier)) {
    return [
      toRollupFieldMetadataValidationError({
        message: 'A rollup filter cannot read a field of another record',
        userFriendlyMessage: msg`A rollup can only be filtered by fields of the related records themselves`,
      }),
    ];
  }

  if (
    isDefined(filter.filterGroupId) &&
    !filterGroupIds.has(filter.filterGroupId)
  ) {
    return [
      toRollupFieldMetadataValidationError({
        message: 'Rollup filter group not found',
        userFriendlyMessage: msg`The rollup filters are invalid`,
      }),
    ];
  }

  if (ROLLUP_TIME_DEPENDENT_FILTER_OPERANDS.includes(filter.operand)) {
    return [
      toRollupFieldMetadataValidationError({
        message: `Rollup filter operand "${filter.operand}" depends on the current date`,
        userFriendlyMessage: msg`A rollup cannot be filtered relative to the current date`,
      }),
    ];
  }

  const { errors: fieldReferenceErrors, flatFieldMetadata } =
    resolveFlatViewFieldRelationScopeFieldReference({
      fieldReference: filter,
      objectMetadataUniversalIdentifier: childObjectMetadataUniversalIdentifier,
      flatFieldMetadataMaps,
    });

  if (!isDefined(flatFieldMetadata)) {
    return fieldReferenceErrors.map(toRollupFieldMetadataValidationError);
  }

  const fieldType = getFieldMetadataValueType({
    type: flatFieldMetadata.type,
    settings: flatFieldMetadata.universalSettings,
  });

  if (!ROLLUP_FILTERABLE_FIELD_METADATA_TYPES.includes(fieldType)) {
    return [
      toRollupFieldMetadataValidationError({
        message: `A rollup cannot be filtered by a ${flatFieldMetadata.type} field`,
        userFriendlyMessage: msg`A rollup cannot be filtered by this type of field`,
      }),
    ];
  }

  const filterOperandContext = {
    operand: filter.operand,
    fieldType,
    subFieldName: filter.subFieldName,
    relationTargetFieldType: undefined,
  };

  return [
    getIncompatibleViewFilterOperandError(filterOperandContext) ??
      getInvalidViewFilterValueError({
        ...filterOperandContext,
        value: filter.value,
      }),
  ]
    .filter(isDefined)
    .map(toRollupFieldMetadataValidationError);
};

export const validateRollupFlatFieldMetadataFilters = ({
  universalSettings: { filters, filterGroups },
  childObjectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  universalSettings: Pick<UniversalRollupSettings, 'filters' | 'filterGroups'>;
  childObjectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatFieldMetadataValidationError[] => {
  const filterGroupIds = new Set(filterGroups.map(({ id }) => id));

  return [
    ...validateFlatViewFieldRelationScopeFilterGroups(filterGroups).map(
      toRollupFieldMetadataValidationError,
    ),
    ...filters.flatMap((filter) =>
      validateRollupFilter({
        filter,
        filterGroupIds,
        childObjectMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      }),
    ),
  ];
};
