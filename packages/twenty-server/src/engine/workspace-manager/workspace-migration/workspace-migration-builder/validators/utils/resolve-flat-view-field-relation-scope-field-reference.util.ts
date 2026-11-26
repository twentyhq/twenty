import { msg, t } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getInvalidFlatViewFieldRelationScopeError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-flat-view-field-relation-scope-error.util';
import { resolveRelationTargetFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-relation-target-flat-field-metadata.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import {
  RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON,
  type RelationTargetFlatFieldMetadataFailureReason,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/constants/relation-target-flat-field-metadata-failure-reason.constant';

type RelationScopeFieldReference = {
  fieldMetadataUniversalIdentifier: string | null;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
};

type ResolvedRelationScopeFieldReference = {
  errors: FlatEntityValidationError[];
  flatFieldMetadata?: UniversalFlatFieldMetadata;
  relationTargetFlatFieldMetadata?: UniversalFlatFieldMetadata;
};

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
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.UNEXPECTED_RELATION_TYPE:
      return getInvalidFlatViewFieldRelationScopeError({
        message: t`A relation scope related record field can only be used on a many-to-one relation field`,
        userFriendlyMessage: msg`Only a field linking to one record can use a field of that record`,
      });
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.NOT_ON_RELATION_TARGET_OBJECT:
      return getInvalidFlatViewFieldRelationScopeError({
        message: t`The relation scope related record field must belong to the relation target object`,
        userFriendlyMessage: msg`The field must belong to the related object`,
      });
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.INACTIVE:
      return getInvalidFlatViewFieldRelationScopeError({
        message: t`The relation scope related record field must be active`,
        userFriendlyMessage: msg`A deactivated field cannot be used to filter or sort related records`,
      });
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.IS_A_RELATION:
      return getInvalidFlatViewFieldRelationScopeError({
        message: t`The relation scope related record field cannot be a relation`,
        userFriendlyMessage: msg`A related record's relation cannot be used to filter or sort`,
      });
  }
};

export const resolveFlatViewFieldRelationScopeFieldReference = ({
  fieldReference: {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  },
  objectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldReference: RelationScopeFieldReference;
  objectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
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
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope fields must belong to the relation target object`,
          userFriendlyMessage: msg`Related records can only be filtered or sorted by their own fields`,
        }),
      ],
    };
  }

  if (!isActiveFlatFieldMetadata(flatFieldMetadata)) {
    return {
      errors: [
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope fields must be active`,
          userFriendlyMessage: msg`A deactivated field cannot be used to filter or sort related records`,
        }),
      ],
    };
  }

  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    if (isOneToManyFlatFieldMetadata(flatFieldMetadata)) {
      return {
        errors: [
          getInvalidFlatViewFieldRelationScopeError({
            message: t`Relation scope fields cannot be one-to-many relations`,
            userFriendlyMessage: msg`Related records cannot be filtered or sorted by a list of records`,
          }),
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
