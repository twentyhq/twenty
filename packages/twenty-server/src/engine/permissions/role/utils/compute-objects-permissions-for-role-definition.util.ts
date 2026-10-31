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

type ObjectRecordsAccess = {
  canRead: boolean;
  canUpdate: boolean;
  canSoftDelete: boolean;
  canDestroy: boolean;
};

const grantAllObjectRecordsAccess = (
  isGranted: boolean,
): ObjectRecordsAccess => ({
  canRead: isGranted,
  canUpdate: isGranted,
  canSoftDelete: isGranted,
  canDestroy: isGranted,
});

const resolveObjectRecordsAccess = ({
  objectMetadata: { id: objectMetadataId, isSystem, universalIdentifier },
  roleDefinition,
}: {
  objectMetadata: Pick<
    ObjectMetadataEntity,
    'id' | 'isSystem' | 'universalIdentifier'
  >;
  roleDefinition: RoleDefinitionForObjectsPermissions;
}): ObjectRecordsAccess => {
  const { isPermissionFlagGranted, objectPermissions } = roleDefinition;

  if (
    WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(universalIdentifier)
  ) {
    return grantAllObjectRecordsAccess(
      isPermissionFlagGranted(PermissionFlagType.WORKFLOWS),
    );
  }

  if (
    universalIdentifier === STANDARD_OBJECTS.workspaceMember.universalIdentifier
  ) {
    return {
      ...grantAllObjectRecordsAccess(
        isPermissionFlagGranted(PermissionFlagType.WORKSPACE_MEMBERS),
      ),
      canRead: true,
    };
  }

  const objectPermissionOverride = objectPermissions.find(
    (objectPermission) =>
      objectPermission.objectMetadataId === objectMetadataId,
  );

  return {
    canRead: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canReadObjectRecords,
      hasAllObjectsPermission: roleDefinition.canReadAllObjectRecords,
      isSystemObject: isSystem,
    }),
    canUpdate: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canUpdateObjectRecords,
      hasAllObjectsPermission: roleDefinition.canUpdateAllObjectRecords,
      isSystemObject: isSystem,
    }),
    canSoftDelete: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canSoftDeleteObjectRecords,
      hasAllObjectsPermission: roleDefinition.canSoftDeleteAllObjectRecords,
      isSystemObject: isSystem,
    }),
    canDestroy: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canDestroyObjectRecords,
      hasAllObjectsPermission: roleDefinition.canDestroyAllObjectRecords,
      isSystemObject: isSystem,
    }),
  };
};

const buildRestrictedFields = ({
  objectMetadata,
  fieldPermissions,
  resolveMorphRelationPermissionFieldIds,
}: {
  objectMetadata: Pick<
    ObjectMetadataEntity,
    'id' | 'labelIdentifierFieldMetadataId'
  >;
  fieldPermissions: RoleDefinitionForObjectsPermissions['fieldPermissions'];
  resolveMorphRelationPermissionFieldIds: (fieldMetadataId: string) => string[];
}): RestrictedFieldsPermissions => {
  const restrictedFields: RestrictedFieldsPermissions = {};

  for (const fieldPermission of fieldPermissions) {
    if (fieldPermission.objectMetadataId !== objectMetadata.id) {
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
      restrictedFields[restrictedFieldId] = mergeRestrictedFieldPermissions({
        existing: restrictedFields[restrictedFieldId],
        incoming: fieldRestriction,
      });
    }
  }

  return restrictedFields;
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
    fieldPermissions,
    rowLevelPermissionPredicates,
    rowLevelPermissionPredicateGroups,
  } = roleDefinition;
  const objectsPermissions: ObjectsPermissions = {};

  for (const objectMetadata of objectMetadataCollection) {
    const { id: objectMetadataId, universalIdentifier } = objectMetadata;

    const isWorkflowObject =
      WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
        universalIdentifier,
      );
    const objectRecordsAccess = resolveObjectRecordsAccess({
      objectMetadata,
      roleDefinition,
    });
    const restrictedFields = isWorkflowObject
      ? {}
      : buildRestrictedFields({
          objectMetadata,
          fieldPermissions,
          resolveMorphRelationPermissionFieldIds,
        });
    const hasAiAccess =
      universalIdentifier !==
        STANDARD_OBJECTS.agentChatThread.universalIdentifier ||
      isPermissionFlagGranted(PermissionFlagType.AI);

    objectsPermissions[objectMetadataId] = {
      canReadObjectRecords: objectRecordsAccess.canRead && hasAiAccess,
      canUpdateObjectRecords: objectRecordsAccess.canUpdate && hasAiAccess,
      canSoftDeleteObjectRecords:
        objectRecordsAccess.canSoftDelete && hasAiAccess,
      canDestroyObjectRecords: objectRecordsAccess.canDestroy && hasAiAccess,
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
