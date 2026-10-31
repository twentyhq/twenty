/* @license Enterprise */

import {
  FieldMetadataType,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

type ResolveWorkspaceMemberPredicateValueArgs = {
  workspaceMember: NonNullable<UserWorkspaceAuthContext['workspaceMember']>;
  workspaceMemberFieldMetadata: OrmFlatFieldMetadata;
  workspaceMemberSubFieldName: string | null;
};

const isOwningRelationFlatFieldMetadata = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): boolean =>
  flatFieldMetadata.type === FieldMetadataType.RELATION &&
  isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
  flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;

export const resolveWorkspaceMemberPredicateValue = ({
  workspaceMember,
  workspaceMemberFieldMetadata,
  workspaceMemberSubFieldName,
}: ResolveWorkspaceMemberPredicateValueArgs): RowLevelPermissionPredicateValue | null => {
  const workspaceMemberValues = workspaceMember as unknown as Record<
    string,
    unknown
  >;

  if (isMorphOrRelationFlatFieldMetadata(workspaceMemberFieldMetadata)) {
    if (!isOwningRelationFlatFieldMetadata(workspaceMemberFieldMetadata)) {
      return null;
    }

    const relatedRecordId =
      workspaceMemberValues[
        computeMorphOrRelationFieldJoinColumnName({
          name: workspaceMemberFieldMetadata.name,
        })
      ];

    return isNonEmptyString(relatedRecordId) ? relatedRecordId : null;
  }

  const rawWorkspaceMemberValue =
    workspaceMemberValues[workspaceMemberFieldMetadata.name];

  if (!isDefined(rawWorkspaceMemberValue)) {
    return null;
  }

  const workspaceMemberValue =
    isDefined(workspaceMemberSubFieldName) &&
    isCompositeFieldMetadataType(workspaceMemberFieldMetadata.type) &&
    isPlainObject(rawWorkspaceMemberValue)
      ? rawWorkspaceMemberValue[workspaceMemberSubFieldName]
      : rawWorkspaceMemberValue;

  if (!isDefined(workspaceMemberValue)) {
    return null;
  }

  if (
    (workspaceMemberFieldMetadata.type === FieldMetadataType.SELECT ||
      workspaceMemberFieldMetadata.type === FieldMetadataType.MULTI_SELECT) &&
    typeof workspaceMemberValue === 'string'
  ) {
    return [workspaceMemberValue];
  }

  return workspaceMemberValue as RowLevelPermissionPredicateValue;
};
