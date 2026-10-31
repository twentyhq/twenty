import { resolveObjectPermissionValue } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { mergeRestrictedFieldPermissions } from 'src/engine/metadata-modules/role/utils/merge-restricted-field-permissions.util';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
];

type RoleDefinitionForObjectsPermissions = Pick<
  FlatRole,
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
> & {
  isPermissionFlagGranted: (permissionFlag: PermissionFlagType) => boolean;
  objectPermissions: Pick<
    ObjectPermissionEntity,
    | 'objectMetadataId'
    | 'canReadObjectRecords'
    | 'canUpdateObjectRecords'
    | 'canSoftDeleteObjectRecords'
    | 'canDestroyObjectRecords'
  >[];
  fieldPermissions: Pick<
    FieldPermissionEntity,
    | 'objectMetadataId'
    | 'fieldMetadataId'
    | 'canReadFieldValue'
    | 'canUpdateFieldValue'
  >[];
  rowLevelPermissionPredicates: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[];
};

export const computeObjectsPermissionsForRoleDefinition = ({
  roleDefinition,
  objectMetadataCollection,
  resolveMorphRelationPermissionFieldIds,
}: {
  roleDefinition: RoleDefinitionForObjectsPermissions;
  objectMetadataCollection: Pick<
    ObjectMetadataEntity,
    'id' | 'isSystem' | 'universalIdentifier' | 'labelIdentifierFieldMetadataId'
  >[];
  resolveMorphRelationPermissionFieldIds: (fieldMetadataId: string) => string[];
}): ObjectsPermissions => {
  const {
    isPermissionFlagGranted,
    objectPermissions,
    fieldPermissions,
    rowLevelPermissionPredicates,
    rowLevelPermissionPredicateGroups,
  } = roleDefinition;
  const objectsPermissions: ObjectsPermissions = {};

  for (const objectMetadata of objectMetadataCollection) {
    const {
      id: objectMetadataId,
      isSystem,
      universalIdentifier,
    } = objectMetadata;

    let canRead = roleDefinition.canReadAllObjectRecords;
    let canUpdate = roleDefinition.canUpdateAllObjectRecords;
    let canSoftDelete = roleDefinition.canSoftDeleteAllObjectRecords;
    let canDestroy = roleDefinition.canDestroyAllObjectRecords;
    const restrictedFields: RestrictedFieldsPermissions = {};

    if (
      WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
        universalIdentifier,
      )
    ) {
      const hasWorkflowsPermissions = isPermissionFlagGranted(
        PermissionFlagType.WORKFLOWS,
      );

      canRead = hasWorkflowsPermissions;
      canUpdate = hasWorkflowsPermissions;
      canSoftDelete = hasWorkflowsPermissions;
      canDestroy = hasWorkflowsPermissions;
    } else {
      if (
        universalIdentifier ===
        STANDARD_OBJECTS.workspaceMember.universalIdentifier
      ) {
        const hasWorkspaceMembersPermissions = isPermissionFlagGranted(
          PermissionFlagType.WORKSPACE_MEMBERS,
        );

        canRead = true;
        canUpdate = hasWorkspaceMembersPermissions;
        canSoftDelete = hasWorkspaceMembersPermissions;
        canDestroy = hasWorkspaceMembersPermissions;
      } else {
        const objectPermissionOverride = objectPermissions.find(
          (objectPermission) =>
            objectPermission.objectMetadataId === objectMetadataId,
        );

        canRead = resolveObjectPermissionValue({
          objectValue: objectPermissionOverride?.canReadObjectRecords,
          allObjectsValue: canRead,
          isSystemObject: isSystem,
        });
        canUpdate = resolveObjectPermissionValue({
          objectValue: objectPermissionOverride?.canUpdateObjectRecords,
          allObjectsValue: canUpdate,
          isSystemObject: isSystem,
        });
        canSoftDelete = resolveObjectPermissionValue({
          objectValue: objectPermissionOverride?.canSoftDeleteObjectRecords,
          allObjectsValue: canSoftDelete,
          isSystemObject: isSystem,
        });
        canDestroy = resolveObjectPermissionValue({
          objectValue: objectPermissionOverride?.canDestroyObjectRecords,
          allObjectsValue: canDestroy,
          isSystemObject: isSystem,
        });
      }

      for (const fieldPermission of fieldPermissions) {
        if (fieldPermission.objectMetadataId !== objectMetadataId) {
          continue;
        }

        if (
          !isDefined(fieldPermission.canReadFieldValue) &&
          !isDefined(fieldPermission.canUpdateFieldValue)
        ) {
          continue;
        }

        const isFieldLabelIdentifier =
          fieldPermission.fieldMetadataId ===
          objectMetadata.labelIdentifierFieldMetadataId;
        const fieldRestriction = {
          canRead: isFieldLabelIdentifier
            ? true
            : fieldPermission.canReadFieldValue,
          canUpdate: fieldPermission.canUpdateFieldValue,
        };

        for (const restrictedFieldId of resolveMorphRelationPermissionFieldIds(
          fieldPermission.fieldMetadataId,
        )) {
          restrictedFields[restrictedFieldId] = mergeRestrictedFieldPermissions(
            {
              existing: restrictedFields[restrictedFieldId],
              incoming: fieldRestriction,
            },
          );
        }
      }
    }

    if (
      universalIdentifier ===
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ) {
      const hasAiPermission = isPermissionFlagGranted(PermissionFlagType.AI);

      canRead = canRead && hasAiPermission;
      canUpdate = canUpdate && hasAiPermission;
      canSoftDelete = canSoftDelete && hasAiPermission;
      canDestroy = canDestroy && hasAiPermission;
    }

    objectsPermissions[objectMetadataId] = {
      canReadObjectRecords: canRead,
      canUpdateObjectRecords: canUpdate,
      canSoftDeleteObjectRecords: canSoftDelete,
      canDestroyObjectRecords: canDestroy,
      restrictedFields,
      rowLevelPermissionPredicates: rowLevelPermissionPredicates.filter(
        (rowLevelPermissionPredicate) =>
          rowLevelPermissionPredicate.objectMetadataId === objectMetadataId,
      ),
      rowLevelPermissionPredicateGroups:
        rowLevelPermissionPredicateGroups.filter(
          (rowLevelPermissionPredicateGroup) =>
            rowLevelPermissionPredicateGroup.objectMetadataId ===
            objectMetadataId,
        ),
    };
  }

  return objectsPermissions;
};
