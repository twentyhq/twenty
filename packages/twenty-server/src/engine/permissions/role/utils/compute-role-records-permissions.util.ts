import { resolveObjectPermissionValue } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectRecordsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RowLevelPermissionRuleEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-rule.entity';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/workflow/common/constants/legacy-workspace-workflow-object-universal-identifiers.constant';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
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
    | 'rowLevelPermissionRuleId'
    | 'canReadFieldValue'
    | 'canUpdateFieldValue'
  >[];
  rowLevelPermissionRules: Pick<
    RowLevelPermissionRuleEntity,
    | 'id'
    | 'objectMetadataId'
    | 'canCreateRecords'
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >[];
  rowLevelPermissionPredicates: (RowLevelPermissionPredicate & {
    rowLevelPermissionRuleId: string | null;
  })[];
  rowLevelPermissionPredicateGroups: (RowLevelPermissionPredicateGroup & {
    rowLevelPermissionRuleId: string | null;
  })[];
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

const buildUnreadableAndUneditableFields = ({
  objectMetadata,
  fieldPermissions,
  resolveMorphRelationPermissionFieldIds,
}: {
  objectMetadata: Pick<ObjectMetadataEntity, 'labelIdentifierFieldMetadataId'>;
  fieldPermissions: RoleDefinitionForRecordsPermissions['fieldPermissions'];
  resolveMorphRelationPermissionFieldIds: (fieldMetadataId: string) => string[];
}): { unreadableFields: string[]; uneditableFields: string[] } => {
  const unreadableFields = new Set<string>();
  const uneditableFields = new Set<string>();

  for (const fieldPermission of fieldPermissions) {
    const isUnreadable =
      fieldPermission.canReadFieldValue === false &&
      fieldPermission.fieldMetadataId !==
        objectMetadata.labelIdentifierFieldMetadataId;

    for (const restrictedFieldId of resolveMorphRelationPermissionFieldIds(
      fieldPermission.fieldMetadataId,
    )) {
      if (isUnreadable) {
        unreadableFields.add(restrictedFieldId);
      }

      if (isUnreadable || fieldPermission.canUpdateFieldValue === false) {
        uneditableFields.add(restrictedFieldId);
      }
    }
  }

  return {
    unreadableFields: [...unreadableFields],
    uneditableFields: [...uneditableFields],
  };
};

const NO_FIELDS = { unreadableFields: [], uneditableFields: [] };

const buildObjectRecordsPermissions = ({
  objectRecordsAccess,
  objectFields,
  rowLevelRecordsPermissions,
}: {
  objectRecordsAccess: ObjectRecordsAccess;
  objectFields: { unreadableFields: string[]; uneditableFields: string[] };
  rowLevelRecordsPermissions: RowLevelRecordsPermissions[];
}): ObjectRecordsPermissions => ({
  canCreateAllRecords: objectRecordsAccess.canCreate,
  canReadAllRecords: objectRecordsAccess.canRead,
  canUpdateAllRecords: objectRecordsAccess.canUpdate,
  canSoftDeleteAllRecords: objectRecordsAccess.canSoftDelete,
  canDestroyAllRecords: objectRecordsAccess.canDestroy,
  ...objectFields,
  ...(rowLevelRecordsPermissions.length > 0 && { rowLevelRecordsPermissions }),
});

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
    rowLevelPermissionRules,
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
    const hasAiAccess =
      universalIdentifier !==
        STANDARD_OBJECTS.agentChatThread.universalIdentifier ||
      isPermissionFlagGranted(PermissionFlagType.AI);

    const rowLevelRecordsPermissions = rowLevelPermissionRules
      .filter((rule) => rule.objectMetadataId === objectMetadataId)
      .map((rule) => ({
        rule,
        predicates: rowLevelPermissionPredicates.filter(
          ({ rowLevelPermissionRuleId }) =>
            rowLevelPermissionRuleId === rule.id,
        ),
      }))
      .filter(({ predicates }) => predicates.length > 0)
      .map(({ rule, predicates }): RowLevelRecordsPermissions => ({
        ruleId: rule.id,
        canCreateRecords: rule.canCreateRecords && hasAiAccess,
        canReadRecords: rule.canReadRecords && hasAiAccess,
        canUpdateRecords: rule.canUpdateRecords && hasAiAccess,
        canSoftDeleteRecords: rule.canSoftDeleteRecords && hasAiAccess,
        canDestroyRecords: rule.canDestroyRecords && hasAiAccess,
        predicates,
        predicateGroups: rowLevelPermissionPredicateGroups.filter(
          ({ rowLevelPermissionRuleId }) =>
            rowLevelPermissionRuleId === rule.id,
        ),
        ...(isWorkflowObject
          ? NO_FIELDS
          : buildUnreadableAndUneditableFields({
              objectMetadata,
              fieldPermissions: fieldPermissions.filter(
                ({ rowLevelPermissionRuleId }) =>
                  rowLevelPermissionRuleId === rule.id,
              ),
              resolveMorphRelationPermissionFieldIds,
            })),
      }));

    objects[objectMetadataId] = buildObjectRecordsPermissions({
      objectFields: isWorkflowObject
        ? NO_FIELDS
        : buildUnreadableAndUneditableFields({
            objectMetadata,
            fieldPermissions: fieldPermissions.filter(
              (fieldPermission) =>
                fieldPermission.objectMetadataId === objectMetadataId &&
                !isDefined(fieldPermission.rowLevelPermissionRuleId),
            ),
            resolveMorphRelationPermissionFieldIds,
          }),
      objectRecordsAccess: {
        canCreate: objectRecordsAccess.canCreate && hasAiAccess,
        canRead: objectRecordsAccess.canRead && hasAiAccess,
        canUpdate: objectRecordsAccess.canUpdate && hasAiAccess,
        canSoftDelete: objectRecordsAccess.canSoftDelete && hasAiAccess,
        canDestroy: objectRecordsAccess.canDestroy && hasAiAccess,
      },
      rowLevelRecordsPermissions,
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
