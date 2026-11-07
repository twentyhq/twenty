import { resolveObjectPermissionValue } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectRecordsPermissions,
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
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
];

type RoleDefinitionForRecordsPermissions = Pick<
  FlatRole,
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
  | 'canCreateAllObjectRecords'
> & {
  isPermissionFlagGranted: (permissionFlag: PermissionFlagType) => boolean;
  // an AI run scope leaves system objects readable but not writable unless it grants them
  areSystemObjectsReadOnlyByDefault?: boolean;
  objectPermissions: Pick<
    ObjectPermissionEntity,
    | 'objectMetadataId'
    | 'canCreateObjectRecords'
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
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canSoftDelete: boolean;
  canDestroy: boolean;
};

const grantAllObjectRecordsAccess = (
  isGranted: boolean,
): ObjectRecordsAccess => ({
  canCreate: isGranted,
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
  roleDefinition: RoleDefinitionForRecordsPermissions;
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

  const isSystemObjectWritableByDefault =
    isSystem && !roleDefinition.areSystemObjectsReadOnlyByDefault;
  const objectPermissionOverride = objectPermissions.find(
    (objectPermission) =>
      objectPermission.objectMetadataId === objectMetadataId,
  );

  return {
    canCreate: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canCreateObjectRecords,
      hasAllObjectsPermission: roleDefinition.canCreateAllObjectRecords,
      isSystemObject: isSystemObjectWritableByDefault,
    }),
    canRead: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canReadObjectRecords,
      hasAllObjectsPermission: roleDefinition.canReadAllObjectRecords,
      isSystemObject: isSystem,
    }),
    canUpdate: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canUpdateObjectRecords,
      hasAllObjectsPermission: roleDefinition.canUpdateAllObjectRecords,
      isSystemObject: isSystemObjectWritableByDefault,
    }),
    canSoftDelete: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canSoftDeleteObjectRecords,
      hasAllObjectsPermission: roleDefinition.canSoftDeleteAllObjectRecords,
      isSystemObject: isSystemObjectWritableByDefault,
    }),
    canDestroy: resolveObjectPermissionValue({
      objectValue: objectPermissionOverride?.canDestroyObjectRecords,
      hasAllObjectsPermission: roleDefinition.canDestroyAllObjectRecords,
      isSystemObject: isSystemObjectWritableByDefault,
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
  fieldPermissions: RoleDefinitionForRecordsPermissions['fieldPermissions'];
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

const buildObjectRecordsPermissions = ({
  objectRecordsAccess,
  restrictedFields,
  predicates,
  predicateGroups,
}: {
  objectRecordsAccess: ObjectRecordsAccess;
  restrictedFields: RestrictedFieldsPermissions;
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
}): ObjectRecordsPermissions => {
  if (predicates.length === 0) {
    return {
      canCreateAllRecords: objectRecordsAccess.canCreate,
      canReadAllRecords: objectRecordsAccess.canRead,
      canUpdateAllRecords: objectRecordsAccess.canUpdate,
      canSoftDeleteAllRecords: objectRecordsAccess.canSoftDelete,
      canDestroyAllRecords: objectRecordsAccess.canDestroy,
      restrictedFields,
    };
  }

  return {
    canCreateAllRecords: false,
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    restrictedFields,
    rowLevelRecordsPermissions: {
      canCreateRecords: objectRecordsAccess.canCreate,
      canReadRecords: objectRecordsAccess.canRead,
      canUpdateRecords: objectRecordsAccess.canUpdate,
      canSoftDeleteRecords: objectRecordsAccess.canSoftDelete,
      canDestroyRecords: objectRecordsAccess.canDestroy,
      predicates,
      predicateGroups,
    },
  };
};

export const computeRoleRecordsPermissions = ({
  roleDefinition,
  objectMetadataCollection,
  resolveMorphRelationPermissionFieldIds,
}: {
  roleDefinition: RoleDefinitionForRecordsPermissions;
  objectMetadataCollection: Pick<
    ObjectMetadataEntity,
    'id' | 'isSystem' | 'universalIdentifier' | 'labelIdentifierFieldMetadataId'
  >[];
  resolveMorphRelationPermissionFieldIds: (fieldMetadataId: string) => string[];
}): RoleRecordsPermissions => {
  const {
    isPermissionFlagGranted,
    fieldPermissions,
    rowLevelPermissionPredicates,
    rowLevelPermissionPredicateGroups,
  } = roleDefinition;
  const objects: RoleRecordsPermissions['objects'] = {};

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

    objects[objectMetadataId] = buildObjectRecordsPermissions({
      objectRecordsAccess: {
        canCreate: objectRecordsAccess.canCreate && hasAiAccess,
        canRead: objectRecordsAccess.canRead && hasAiAccess,
        canUpdate: objectRecordsAccess.canUpdate && hasAiAccess,
        canSoftDelete: objectRecordsAccess.canSoftDelete && hasAiAccess,
        canDestroy: objectRecordsAccess.canDestroy && hasAiAccess,
      },
      restrictedFields,
      predicates: rowLevelPermissionPredicates.filter(
        (rowLevelPermissionPredicate) =>
          rowLevelPermissionPredicate.objectMetadataId === objectMetadataId,
      ),
      predicateGroups: rowLevelPermissionPredicateGroups.filter(
        (rowLevelPermissionPredicateGroup) =>
          rowLevelPermissionPredicateGroup.objectMetadataId ===
          objectMetadataId,
      ),
    });
  }

  return {
    canReadAllRecords: roleDefinition.canReadAllObjectRecords,
    canUpdateAllRecords: roleDefinition.canUpdateAllObjectRecords,
    canSoftDeleteAllRecords: roleDefinition.canSoftDeleteAllObjectRecords,
    canDestroyAllRecords: roleDefinition.canDestroyAllObjectRecords,
    objects,
  };
};
