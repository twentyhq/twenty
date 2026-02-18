/* @license Enterprise */

import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/row-level-permission-predicate-entity-relation-properties.constant';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate =
  ({
    entity: rowLevelPermissionPredicateEntity,
    applicationIdToUniversalIdentifierMap,
    fieldMetadataIdToUniversalIdentifierMap,
    objectMetadataIdToUniversalIdentifierMap,
    roleIdToUniversalIdentifierMap,
    rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
  }: FromEntityToFlatEntityArgs<'rowLevelPermissionPredicate'>): FlatRowLevelPermissionPredicate => {
    const rowLevelPermissionPredicateEntityWithoutRelations =
      removePropertiesFromRecord(rowLevelPermissionPredicateEntity, [
        ...ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES,
      ] as (typeof ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES)[number][]);

    const applicationUniversalIdentifier =
      applicationIdToUniversalIdentifierMap.get(
        rowLevelPermissionPredicateEntity.applicationId,
      );

    if (!isDefined(applicationUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Application with id ${rowLevelPermissionPredicateEntity.applicationId} not found for rowLevelPermissionPredicate ${rowLevelPermissionPredicateEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const fieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        rowLevelPermissionPredicateEntity.fieldMetadataId,
      );

    if (!isDefined(fieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `FieldMetadata with id ${rowLevelPermissionPredicateEntity.fieldMetadataId} not found for rowLevelPermissionPredicate ${rowLevelPermissionPredicateEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const objectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        rowLevelPermissionPredicateEntity.objectMetadataId,
      );

    if (!isDefined(objectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ObjectMetadata with id ${rowLevelPermissionPredicateEntity.objectMetadataId} not found for rowLevelPermissionPredicate ${rowLevelPermissionPredicateEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
      rowLevelPermissionPredicateEntity.roleId,
    );

    if (!isDefined(roleUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Role with id ${rowLevelPermissionPredicateEntity.roleId} not found for rowLevelPermissionPredicate ${rowLevelPermissionPredicateEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    let workspaceMemberFieldMetadataUniversalIdentifier: string | null = null;

    if (
      isDefined(
        rowLevelPermissionPredicateEntity.workspaceMemberFieldMetadataId,
      )
    ) {
      workspaceMemberFieldMetadataUniversalIdentifier =
        fieldMetadataIdToUniversalIdentifierMap.get(
          rowLevelPermissionPredicateEntity.workspaceMemberFieldMetadataId,
        ) ?? null;

      if (!isDefined(workspaceMemberFieldMetadataUniversalIdentifier)) {
        throw new FlatEntityMapsException(
          `FieldMetadata with id ${rowLevelPermissionPredicateEntity.workspaceMemberFieldMetadataId} not found for rowLevelPermissionPredicate ${rowLevelPermissionPredicateEntity.id}`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }
    }

    let rowLevelPermissionPredicateGroupUniversalIdentifier: string | null =
      null;

    if (
      isDefined(
        rowLevelPermissionPredicateEntity.rowLevelPermissionPredicateGroupId,
      )
    ) {
      rowLevelPermissionPredicateGroupUniversalIdentifier =
        rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap.get(
          rowLevelPermissionPredicateEntity.rowLevelPermissionPredicateGroupId,
        ) ?? null;

      if (!isDefined(rowLevelPermissionPredicateGroupUniversalIdentifier)) {
        throw new FlatEntityMapsException(
          `RowLevelPermissionPredicateGroup with id ${rowLevelPermissionPredicateEntity.rowLevelPermissionPredicateGroupId} not found for rowLevelPermissionPredicate ${rowLevelPermissionPredicateEntity.id}`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }
    }

    return {
      ...rowLevelPermissionPredicateEntityWithoutRelations,
      createdAt: rowLevelPermissionPredicateEntity.createdAt.toISOString(),
      updatedAt: rowLevelPermissionPredicateEntity.updatedAt.toISOString(),
      deletedAt:
        rowLevelPermissionPredicateEntity.deletedAt?.toISOString() ?? null,
      universalIdentifier:
        rowLevelPermissionPredicateEntityWithoutRelations.universalIdentifier,
      applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      roleUniversalIdentifier,
      workspaceMemberFieldMetadataUniversalIdentifier,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
    };
  };
