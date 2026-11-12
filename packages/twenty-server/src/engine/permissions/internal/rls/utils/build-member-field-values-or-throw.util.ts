/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/permissions/internal/rls/utils/resolve-workspace-member-predicate-value.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

export const buildMemberFieldValuesOrThrow = ({
  workspaceMember,
  predicates,
  flatFieldMetadataMaps,
}: {
  workspaceMember: RlsWorkspaceMember | undefined;
  predicates: Pick<
    RowLevelPermissionPredicate,
    'id' | 'workspaceMemberFieldMetadataId' | 'workspaceMemberSubFieldName'
  >[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RlsMemberFieldValues => {
  const memberFieldValues: RlsMemberFieldValues = {};

  if (!isDefined(workspaceMember)) {
    return memberFieldValues;
  }

  for (const predicate of predicates) {
    const { workspaceMemberFieldMetadataId } = predicate;

    if (!isDefined(workspaceMemberFieldMetadataId)) {
      continue;
    }

    const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceMemberFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(workspaceMemberFieldMetadata)) {
      throw new PermissionsException(
        `Workspace member field metadata not found for row level predicate ${predicate.id}`,
        PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    memberFieldValues[buildMemberFieldKey(predicate)] =
      resolveWorkspaceMemberPredicateValue({
        workspaceMember,
        workspaceMemberFieldMetadata,
        workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
      });
  }

  return memberFieldValues;
};
