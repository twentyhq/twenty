import { getRowLevelPermissionRuleUniversalIdentifier } from '@/application/deterministic-identifier/get-row-level-permission-rule-universal-identifier.util';
import {
  type AllRecordsPermissionsManifest,
  type FieldPermissionManifest,
  type NormalizedRoleManifest,
  type ObjectRecordsPermissionsManifest,
  type RoleManifest,
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionRuleManifest,
} from '@/application/roleManifestType';
import { nestRowLevelPermissionRuleManifests } from '@/application/utils/nestRowLevelPermissionRuleManifests';
import { isDefined } from '@/utils/validation/isDefined';

const NO_ALL_RECORDS_PERMISSIONS = {
  canReadAllRecords: false,
  canCreateAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
} satisfies Required<AllRecordsPermissionsManifest>;

const pickDefinedAllRecordsPermissions = ({
  canReadAllRecords,
  canCreateAllRecords,
  canUpdateAllRecords,
  canSoftDeleteAllRecords,
  canDestroyAllRecords,
}: AllRecordsPermissionsManifest): AllRecordsPermissionsManifest => ({
  ...(isDefined(canReadAllRecords) ? { canReadAllRecords } : {}),
  ...(isDefined(canCreateAllRecords) ? { canCreateAllRecords } : {}),
  ...(isDefined(canUpdateAllRecords) ? { canUpdateAllRecords } : {}),
  ...(isDefined(canSoftDeleteAllRecords) ? { canSoftDeleteAllRecords } : {}),
  ...(isDefined(canDestroyAllRecords) ? { canDestroyAllRecords } : {}),
});

const findTopLevelPredicateGroupUniversalIdentifier = ({
  predicateGroupUniversalIdentifier,
  predicateGroupByUniversalIdentifier,
}: {
  predicateGroupUniversalIdentifier: string;
  predicateGroupByUniversalIdentifier: Map<
    string,
    RowLevelPermissionPredicateGroupManifest
  >;
}): string => {
  const visitedUniversalIdentifiers = new Set<string>();
  let currentUniversalIdentifier = predicateGroupUniversalIdentifier;

  while (!visitedUniversalIdentifiers.has(currentUniversalIdentifier)) {
    visitedUniversalIdentifiers.add(currentUniversalIdentifier);

    const parentUniversalIdentifier = predicateGroupByUniversalIdentifier.get(
      currentUniversalIdentifier,
    )?.parentPredicateGroupUniversalIdentifier;

    if (!isDefined(parentUniversalIdentifier)) {
      break;
    }

    currentUniversalIdentifier = parentUniversalIdentifier;
  }

  return currentUniversalIdentifier;
};

const addFieldPermissionToObject = ({
  object,
  fieldPermission,
}: {
  object: ObjectRecordsPermissionsManifest;
  fieldPermission: FieldPermissionManifest;
}): ObjectRecordsPermissionsManifest => {
  const { fieldUniversalIdentifier, universalIdentifier } = fieldPermission;
  const unreadableFields =
    fieldPermission.canReadFieldValue === false
      ? [...(object.unreadableFields ?? []), fieldUniversalIdentifier]
      : object.unreadableFields;
  const uneditableFields =
    fieldPermission.canUpdateFieldValue === false
      ? [...(object.uneditableFields ?? []), fieldUniversalIdentifier]
      : object.uneditableFields;
  const fieldPermissionIdentifiers = isDefined(universalIdentifier)
    ? [
        ...(object.fieldPermissionIdentifiers ?? []),
        { fieldUniversalIdentifier, universalIdentifier },
      ]
    : object.fieldPermissionIdentifiers;

  return {
    ...object,
    ...(isDefined(unreadableFields) ? { unreadableFields } : {}),
    ...(isDefined(uneditableFields) ? { uneditableFields } : {}),
    ...(isDefined(fieldPermissionIdentifiers)
      ? { fieldPermissionIdentifiers }
      : {}),
  };
};

export const normalizeRoleManifestRecordsPermissions = ({
  role,
  applicationUniversalIdentifier,
}: {
  role: RoleManifest;
  applicationUniversalIdentifier: string;
}): NormalizedRoleManifest => {
  const {
    recordsPermissions = {},
    canReadAllObjectRecords,
    canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords,
    objectPermissions = [],
    fieldPermissions = [],
    rowLevelPermissionPredicateGroups: predicateGroups = [],
    rowLevelPermissionPredicates: predicates = [],
    ...roleWithoutRecordsPermissions
  } = role;
  const allRecordsPermissions = pickDefinedAllRecordsPermissions({
    canReadAllRecords:
      recordsPermissions.canReadAllRecords ?? canReadAllObjectRecords,
    canCreateAllRecords: recordsPermissions.canCreateAllRecords,
    canUpdateAllRecords:
      recordsPermissions.canUpdateAllRecords ?? canUpdateAllObjectRecords,
    canSoftDeleteAllRecords:
      recordsPermissions.canSoftDeleteAllRecords ??
      canSoftDeleteAllObjectRecords,
    canDestroyAllRecords:
      recordsPermissions.canDestroyAllRecords ?? canDestroyAllObjectRecords,
  });

  const objectByUniversalIdentifier = new Map<
    string,
    ObjectRecordsPermissionsManifest
  >(
    [
      ...(recordsPermissions.objects ?? []),
      ...objectPermissions.map(
        ({
          universalIdentifier,
          objectUniversalIdentifier,
          canReadObjectRecords,
          canUpdateObjectRecords,
          canSoftDeleteObjectRecords,
          canDestroyObjectRecords,
        }) => ({
          ...(isDefined(universalIdentifier) ? { universalIdentifier } : {}),
          objectUniversalIdentifier,
          ...pickDefinedAllRecordsPermissions({
            canReadAllRecords: canReadObjectRecords,
            canUpdateAllRecords: canUpdateObjectRecords,
            canSoftDeleteAllRecords: canSoftDeleteObjectRecords,
            canDestroyAllRecords: canDestroyObjectRecords,
          }),
        }),
      ),
    ].map((object) => [object.objectUniversalIdentifier, object]),
  );
  const findOrCreateObject = (
    objectUniversalIdentifier: string,
  ): ObjectRecordsPermissionsManifest => {
    const object = objectByUniversalIdentifier.get(
      objectUniversalIdentifier,
    ) ?? {
      objectUniversalIdentifier,
    };

    objectByUniversalIdentifier.set(objectUniversalIdentifier, object);

    return object;
  };

  for (const fieldPermission of fieldPermissions) {
    const object = findOrCreateObject(
      fieldPermission.objectUniversalIdentifier,
    );

    objectByUniversalIdentifier.set(
      object.objectUniversalIdentifier,
      addFieldPermissionToObject({ object, fieldPermission }),
    );
  }

  const predicateGroupByUniversalIdentifier = new Map(
    predicateGroups.map((predicateGroup) => [
      predicateGroup.universalIdentifier,
      predicateGroup,
    ]),
  );
  const derivedRuleByUniversalIdentifier = new Map<
    string,
    Omit<RowLevelPermissionRuleManifest, 'predicates' | 'predicateGroups'>
  >();
  const findOrCreateDerivedRuleUniversalIdentifier = ({
    objectUniversalIdentifier,
    predicateGroupUniversalIdentifier,
  }: {
    objectUniversalIdentifier: string;
    predicateGroupUniversalIdentifier: string | null | undefined;
  }): string => {
    const topLevelPredicateGroupUniversalIdentifier = isDefined(
      predicateGroupUniversalIdentifier,
    )
      ? findTopLevelPredicateGroupUniversalIdentifier({
          predicateGroupUniversalIdentifier,
          predicateGroupByUniversalIdentifier,
        })
      : null;
    const universalIdentifier = getRowLevelPermissionRuleUniversalIdentifier({
      applicationUniversalIdentifier,
      roleUniversalIdentifier: role.universalIdentifier,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      rootRowLevelPermissionPredicateGroupUniversalIdentifier:
        topLevelPredicateGroupUniversalIdentifier,
    });

    if (!derivedRuleByUniversalIdentifier.has(universalIdentifier)) {
      const object = findOrCreateObject(objectUniversalIdentifier);
      const canUpdateRecords =
        object.canUpdateAllRecords ??
        allRecordsPermissions.canUpdateAllRecords ??
        false;

      derivedRuleByUniversalIdentifier.set(universalIdentifier, {
        universalIdentifier,
        objectUniversalIdentifier,
        canReadRecords:
          object.canReadAllRecords ??
          allRecordsPermissions.canReadAllRecords ??
          false,
        canCreateRecords:
          object.canCreateAllRecords ??
          object.canUpdateAllRecords ??
          allRecordsPermissions.canCreateAllRecords ??
          canUpdateRecords,
        canUpdateRecords,
        canSoftDeleteRecords:
          object.canSoftDeleteAllRecords ??
          allRecordsPermissions.canSoftDeleteAllRecords ??
          false,
        canDestroyRecords:
          object.canDestroyAllRecords ??
          allRecordsPermissions.canDestroyAllRecords ??
          false,
      });
    }

    return universalIdentifier;
  };

  const { rules: derivedRules } = nestRowLevelPermissionRuleManifests({
    predicateGroups: predicateGroups.map((predicateGroup) => ({
      ...predicateGroup,
      rowLevelPermissionRuleUniversalIdentifier:
        findOrCreateDerivedRuleUniversalIdentifier({
          objectUniversalIdentifier: predicateGroup.objectUniversalIdentifier,
          predicateGroupUniversalIdentifier: predicateGroup.universalIdentifier,
        }),
    })),
    predicates: predicates.map((predicate) => ({
      ...predicate,
      rowLevelPermissionRuleUniversalIdentifier:
        findOrCreateDerivedRuleUniversalIdentifier({
          objectUniversalIdentifier: predicate.objectUniversalIdentifier,
          predicateGroupUniversalIdentifier:
            predicate.predicateGroupUniversalIdentifier,
        }),
    })),
    rules: [...derivedRuleByUniversalIdentifier.values()],
  });

  // All records wins over the rules, so a derived rule takes the grants of its object over
  for (const { objectUniversalIdentifier, ...rule } of derivedRules) {
    const object = findOrCreateObject(objectUniversalIdentifier);

    objectByUniversalIdentifier.set(objectUniversalIdentifier, {
      ...object,
      ...NO_ALL_RECORDS_PERMISSIONS,
      rowLevelRecordsPermissions: [
        ...(object.rowLevelRecordsPermissions ?? []),
        rule,
      ],
    });
  }

  return {
    ...roleWithoutRecordsPermissions,
    recordsPermissions: {
      ...allRecordsPermissions,
      objects: [...objectByUniversalIdentifier.values()],
    },
  };
};
