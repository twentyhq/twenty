import { msg, t } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import {
  RelationType,
  type UniversalViewFieldRelationScope,
} from 'twenty-shared/types';
import { isDefined, isValidRelationScopeLimit } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getInvalidFlatViewFieldRelationScopeError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-flat-view-field-relation-scope-error.util';
import { validateFlatViewFieldRelationScopeFilterGroups } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope-filter-groups.util';
import { validateFlatViewFieldRelationScopeFilter } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope-filter.util';
import { validateFlatViewFieldRelationScopeSort } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope-sort.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const validateRelationScopeLimit = (
  limit: UniversalViewFieldRelationScope['limit'],
): FlatEntityValidationError[] => {
  if (isValidRelationScopeLimit(limit)) {
    return [];
  }

  return [
    getInvalidFlatViewFieldRelationScopeError({
      message: t`Relation scope limit must be an integer between 1 and ${QUERY_MAX_RECORDS_FROM_RELATION}`,
      userFriendlyMessage: msg`The number of related records to show is out of range`,
    }),
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
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatEntityValidationError[] => {
  if (!isDefined(universalRelationScope)) {
    return [];
  }

  if (isCanonical) {
    return [
      getInvalidFlatViewFieldRelationScopeError({
        message: t`Only non-canonical view fields can have a relation scope`,
        userFriendlyMessage: msg`Only added columns can filter, sort or limit related records`,
      }),
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
      getInvalidFlatViewFieldRelationScopeError({
        message: t`A relation scope can only be set on a one-to-many relation field`,
        userFriendlyMessage: msg`Only a column listing related records can filter, sort or limit them`,
      }),
    ];
  }

  const filterIds = new Set<string>();
  const filterGroupIds = new Set(
    universalRelationScope.filterGroups.map(({ id }) => id),
  );

  return [
    ...validateRelationScopeLimit(universalRelationScope.limit),
    ...validateFlatViewFieldRelationScopeFilterGroups(
      universalRelationScope.filterGroups,
    ),
    ...universalRelationScope.filters.flatMap((filter) =>
      validateFlatViewFieldRelationScopeFilter({
        filter,
        filterIds,
        filterGroupIds,
        objectMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
      }),
    ),
    ...universalRelationScope.sorts.flatMap((sort) =>
      validateFlatViewFieldRelationScopeSort({
        sort,
        objectMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      }),
    ),
  ];
};
