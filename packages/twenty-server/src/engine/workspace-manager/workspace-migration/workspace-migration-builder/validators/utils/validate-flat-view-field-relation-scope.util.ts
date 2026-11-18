import { msg, t } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  RelationType,
  type UniversalViewFieldRelationScope,
  ViewFilterGroupLogicalOperator,
  ViewSortDirection,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getIncompatibleViewFilterOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-view-filter-operand-error.util';
import { getInvalidViewFilterSelectOptionError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-select-option-error.util';
import { getInvalidViewFilterValueError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-value-error.util';
import {
  type RelationTargetFlatFieldMetadataFailureReason,
  resolveRelationTargetFlatFieldMetadata,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-relation-target-flat-field-metadata.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

type FlatFieldMetadataMaps =
  AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];

type RelationScopeFieldReference = {
  fieldMetadataUniversalIdentifier: string | null;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
};

type ResolvedRelationScopeFieldReference = {
  errors: FlatEntityValidationError[];
  flatFieldMetadata?: UniversalFlatFieldMetadata;
  relationTargetFlatFieldMetadata?: UniversalFlatFieldMetadata;
};

const invalidRelationScopeError = (
  message: string,
  userFriendlyMessage: FlatEntityValidationError['userFriendlyMessage'],
): FlatEntityValidationError => ({
  code: ViewExceptionCode.INVALID_VIEW_DATA,
  message,
  userFriendlyMessage,
});

const isActiveFlatFieldMetadata = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
) =>
  resolveEffectiveUniversalFlatEntityProperty({
    metadataName: 'fieldMetadata',
    universalFlatEntity: flatFieldMetadata,
    property: 'isActive',
  });

const isOneToManyFlatFieldMetadata = ({
  type,
  universalSettings,
}: UniversalFlatFieldMetadata) =>
  isMorphOrRelationFieldMetadataType(type) &&
  isDefined(universalSettings) &&
  'relationType' in universalSettings &&
  universalSettings.relationType === RelationType.ONE_TO_MANY;

const getRelationTargetError = (
  failureReason: RelationTargetFlatFieldMetadataFailureReason,
): FlatEntityValidationError => {
  switch (failureReason) {
    case 'NOT_A_MANY_TO_ONE_RELATION':
      return invalidRelationScopeError(
        t`A relation scope related record field can only be used on a many-to-one relation field`,
        msg`Only a field linking to one record can use a field of that record`,
      );
    case 'NOT_ON_RELATION_TARGET_OBJECT':
      return invalidRelationScopeError(
        t`The relation scope related record field must belong to the relation target object`,
        msg`The field must belong to the related object`,
      );
    case 'INACTIVE':
      return invalidRelationScopeError(
        t`The relation scope related record field must be active`,
        msg`A deactivated field cannot be used to filter or sort related records`,
      );
    case 'IS_A_RELATION':
      return invalidRelationScopeError(
        t`The relation scope related record field cannot be a relation`,
        msg`A related record's relation cannot be used to filter or sort`,
      );
  }
};

const resolveRelationScopeFieldReference = ({
  fieldReference: {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  },
  objectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldReference: RelationScopeFieldReference;
  objectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
}): ResolvedRelationScopeFieldReference => {
  const flatFieldMetadata = isDefined(fieldMetadataUniversalIdentifier)
    ? findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (
    !isDefined(flatFieldMetadata) ||
    flatFieldMetadata.objectMetadataUniversalIdentifier !==
      objectMetadataUniversalIdentifier
  ) {
    return {
      errors: [
        invalidRelationScopeError(
          t`Relation scope fields must belong to the relation target object`,
          msg`Related records can only be filtered or sorted by their own fields`,
        ),
      ],
    };
  }

  if (!isActiveFlatFieldMetadata(flatFieldMetadata)) {
    return {
      errors: [
        invalidRelationScopeError(
          t`Relation scope fields must be active`,
          msg`A deactivated field cannot be used to filter or sort related records`,
        ),
      ],
    };
  }

  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    if (isOneToManyFlatFieldMetadata(flatFieldMetadata)) {
      return {
        errors: [
          invalidRelationScopeError(
            t`Relation scope fields cannot be one-to-many relations`,
            msg`Related records cannot be filtered or sorted by a list of records`,
          ),
        ],
      };
    }

    return { errors: [], flatFieldMetadata };
  }

  const relationTarget = resolveRelationTargetFlatFieldMetadata({
    flatFieldMetadata,
    relationTargetFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });

  if ('failureReason' in relationTarget) {
    return { errors: [getRelationTargetError(relationTarget.failureReason)] };
  }

  return {
    errors: [],
    flatFieldMetadata,
    relationTargetFlatFieldMetadata:
      relationTarget.relationTargetFlatFieldMetadata,
  };
};

const validateRelationScopeFilterGroups = (
  filterGroups: UniversalViewFieldRelationScope['filterGroups'],
): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];
  const parentFilterGroupIdById = new Map<string, string | null | undefined>();

  for (const filterGroup of filterGroups) {
    if (
      !isValidUuid(filterGroup.id) ||
      parentFilterGroupIdById.has(filterGroup.id)
    ) {
      errors.push(
        invalidRelationScopeError(
          t`Relation scope filter group ids must be unique UUIDs`,
          msg`Related records filter groups are invalid`,
        ),
      );
    }

    if (
      !Object.values(ViewFilterGroupLogicalOperator).includes(
        filterGroup.logicalOperator,
      )
    ) {
      errors.push(
        invalidRelationScopeError(
          t`Relation scope filter group has an invalid logical operator`,
          msg`Related records filter groups are invalid`,
        ),
      );
    }

    parentFilterGroupIdById.set(
      filterGroup.id,
      filterGroup.parentFilterGroupId,
    );
  }

  for (const filterGroup of filterGroups) {
    if (
      isDefined(filterGroup.parentFilterGroupId) &&
      !parentFilterGroupIdById.has(filterGroup.parentFilterGroupId)
    ) {
      errors.push(
        invalidRelationScopeError(
          t`Relation scope filter group parent not found`,
          msg`Related records filter groups are invalid`,
        ),
      );
      continue;
    }

    const visitedFilterGroupIds = new Set<string>([filterGroup.id]);
    let parentFilterGroupId = filterGroup.parentFilterGroupId;

    while (isDefined(parentFilterGroupId)) {
      if (visitedFilterGroupIds.has(parentFilterGroupId)) {
        errors.push(
          invalidRelationScopeError(
            t`Relation scope filter groups cannot be nested in themselves`,
            msg`Related records filter groups are invalid`,
          ),
        );
        break;
      }

      visitedFilterGroupIds.add(parentFilterGroupId);
      parentFilterGroupId = parentFilterGroupIdById.get(parentFilterGroupId);
    }
  }

  return errors;
};

const validateRelationScopeFilter = ({
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
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (!isValidUuid(filter.id) || filterIds.has(filter.id)) {
    errors.push(
      invalidRelationScopeError(
        t`Relation scope filter ids must be unique UUIDs`,
        msg`Related records filters are invalid`,
      ),
    );
  }

  filterIds.add(filter.id);

  if (
    isDefined(filter.filterGroupId) &&
    !filterGroupIds.has(filter.filterGroupId)
  ) {
    errors.push(
      invalidRelationScopeError(
        t`Relation scope filter group not found`,
        msg`Related records filters are invalid`,
      ),
    );
  }

  const {
    errors: fieldReferenceErrors,
    flatFieldMetadata,
    relationTargetFlatFieldMetadata,
  } = resolveRelationScopeFieldReference({
    fieldReference: filter,
    objectMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });

  errors.push(...fieldReferenceErrors);

  if (!isDefined(flatFieldMetadata)) {
    return errors;
  }

  const filterFieldArgs = {
    operand: filter.operand,
    fieldType: flatFieldMetadata.type,
    subFieldName: filter.subFieldName,
    relationTargetFieldType: relationTargetFlatFieldMetadata?.type,
  };

  const incompatibleOperandError =
    getIncompatibleViewFilterOperandError(filterFieldArgs);

  if (isDefined(incompatibleOperandError)) {
    return [...errors, incompatibleOperandError];
  }

  const invalidValueError = getInvalidViewFilterValueError({
    ...filterFieldArgs,
    value: filter.value,
  });

  if (isDefined(invalidValueError)) {
    errors.push(invalidValueError);
  }

  const effectiveFlatFieldMetadata =
    relationTargetFlatFieldMetadata ?? flatFieldMetadata;

  if (
    isFieldMetadataEntityOfType(
      effectiveFlatFieldMetadata,
      FieldMetadataType.SELECT,
    ) ||
    isFieldMetadataEntityOfType(
      effectiveFlatFieldMetadata,
      FieldMetadataType.MULTI_SELECT,
    )
  ) {
    const invalidSelectOptionError = getInvalidViewFilterSelectOptionError({
      referencedFieldMetadata: effectiveFlatFieldMetadata,
      flatFieldMetadataOptionMaps,
      operand: filter.operand,
      value: filter.value,
    });

    if (isDefined(invalidSelectOptionError)) {
      errors.push(invalidSelectOptionError);
    }
  }

  return errors;
};

const validateRelationScopeSort = ({
  sort,
  objectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  sort: UniversalViewFieldRelationScope['sorts'][number];
  objectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
}): FlatEntityValidationError[] => {
  const errors = resolveRelationScopeFieldReference({
    fieldReference: sort,
    objectMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }).errors;

  if (!Object.values(ViewSortDirection).includes(sort.direction)) {
    errors.push(
      invalidRelationScopeError(
        t`Relation scope sort has an invalid direction`,
        msg`Related records sort direction should be ascending or descending`,
      ),
    );
  }

  return errors;
};

const validateRelationScopeLimit = (
  limit: UniversalViewFieldRelationScope['limit'],
): FlatEntityValidationError[] => {
  if (
    !isDefined(limit) ||
    (Number.isInteger(limit) &&
      limit >= 1 &&
      limit <= QUERY_MAX_RECORDS_FROM_RELATION)
  ) {
    return [];
  }

  return [
    invalidRelationScopeError(
      t`Relation scope limit must be an integer between 1 and ${QUERY_MAX_RECORDS_FROM_RELATION}`,
      msg`The number of related records to show is out of range`,
    ),
  ];
};

export const validateFlatViewFieldRelationScope = ({
  flatViewField: { isCanonical, universalRelationScope },
  flatFieldMetadata,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    'isCanonical' | 'universalRelationScope'
  >;
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatEntityValidationError[] => {
  if (!isDefined(universalRelationScope)) {
    return [];
  }

  if (isCanonical) {
    return [
      invalidRelationScopeError(
        t`Only non-canonical view fields can have a relation scope`,
        msg`Only added columns can filter, sort or limit related records`,
      ),
    ];
  }

  const objectMetadataUniversalIdentifier =
    flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier;

  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.ONE_TO_MANY,
    }) ||
    !isDefined(objectMetadataUniversalIdentifier)
  ) {
    return [
      invalidRelationScopeError(
        t`A relation scope can only be set on a one-to-many relation field`,
        msg`Only a column listing related records can filter, sort or limit them`,
      ),
    ];
  }

  const filterIds = new Set<string>();
  const filterGroupIds = new Set(
    universalRelationScope.filterGroups.map(({ id }) => id),
  );

  return [
    ...validateRelationScopeLimit(universalRelationScope.limit),
    ...validateRelationScopeFilterGroups(universalRelationScope.filterGroups),
    ...universalRelationScope.filters.flatMap((filter) =>
      validateRelationScopeFilter({
        filter,
        filterIds,
        filterGroupIds,
        objectMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ),
    ...universalRelationScope.sorts.flatMap((sort) =>
      validateRelationScopeSort({
        sort,
        objectMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      }),
    ),
  ];
};
