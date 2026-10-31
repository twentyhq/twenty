import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { mergeRestrictedFieldPermissions } from 'src/engine/metadata-modules/role/utils/merge-restricted-field-permissions.util';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
];

export type RoleObjectPermissionOverride = {
  objectMetadataId: string;
  canReadObjectRecords?: boolean | null;
  canUpdateObjectRecords?: boolean | null;
  canSoftDeleteObjectRecords?: boolean | null;
  canDestroyObjectRecords?: boolean | null;
};

export type RoleFieldPermissionOverride = {
  objectMetadataId: string;
  fieldMetadataId: string;
  canReadFieldValue?: boolean | null;
  canUpdateFieldValue?: boolean | null;
};

// What a role says about records, whether it is stored or written inline on an AI run
export type RoleDefinitionForObjectsPermissions = {
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  isPermissionFlagGranted: (permissionFlag: PermissionFlagType) => boolean;
  objectPermissions: RoleObjectPermissionOverride[];
  fieldPermissions: RoleFieldPermissionOverride[];
  rowLevelPermissionPredicates: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[];
};

export type ObjectMetadataForObjectsPermissions = {
  id: string;
  isSystem: boolean;
  universalIdentifier: string;
  labelIdentifierFieldMetadataId: string | null;
};

export const computeObjectsPermissionsForRoleDefinition = ({
  roleDefinition,
  objectMetadataCollection,
  resolveMorphRelationPermissionFieldIds,
}: {
  roleDefinition: RoleDefinitionForObjectsPermissions;
  objectMetadataCollection: ObjectMetadataForObjectsPermissions[];
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

        const getPermissionValue = (
          overrideValue: boolean | null | undefined,
          defaultValue: boolean,
        ) => overrideValue ?? (isSystem ? true : defaultValue);

        canRead = getPermissionValue(
          objectPermissionOverride?.canReadObjectRecords,
          canRead,
        );
        canUpdate = getPermissionValue(
          objectPermissionOverride?.canUpdateObjectRecords,
          canUpdate,
        );
        canSoftDelete = getPermissionValue(
          objectPermissionOverride?.canSoftDeleteObjectRecords,
          canSoftDelete,
        );
        canDestroy = getPermissionValue(
          objectPermissionOverride?.canDestroyObjectRecords,
          canDestroy,
        );
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
