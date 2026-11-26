import { type ApplicationManifest } from '@/application/applicationType';
import {
  type LegacyCompliantRoleManifest,
  type ObjectRecordsPermissionsManifest,
} from '@/application/roleManifestType';
import {
  type ApplicationManifestRoleKind,
  type ApplicationManifestRoleSources,
  classifyApplicationManifestRoles,
} from '@/application/utils/classifyApplicationManifestRoles';
import { doNotTranslate } from '@/i18n/do-not-translate';
import { normalizeLegacyCompliantRoleManifest } from '@/application/utils/normalizeLegacyCompliantRoleManifest';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

type ApplicationManifestRoleReference = {
  roleUniversalIdentifier: string;
  roleLabel: string;
};

export type ApplicationManifestRoleViolation =
  | (ApplicationManifestRoleReference & { kind: 'standaloneRole' })
  | (ApplicationManifestRoleReference & {
      kind: 'rowLevelRules' | 'fieldPermissions';
      roleKinds: ApplicationManifestRoleKind[];
      objectUniversalIdentifiers: string[];
    });

const hasRowLevelRules = (object: ObjectRecordsPermissionsManifest) =>
  isNonEmptyArray(object.rowLevelRecordsPermissions);

// A legacy field permission granting nothing still becomes a stored row through its identifier
const hasFieldPermissions = (object: ObjectRecordsPermissionsManifest) =>
  [object, ...(object.rowLevelRecordsPermissions ?? [])].some(
    ({ unreadableFields, uneditableFields, fieldPermissionIdentifiers }) =>
      isNonEmptyArray(unreadableFields) ||
      isNonEmptyArray(uneditableFields) ||
      isNonEmptyArray(fieldPermissionIdentifiers),
  );

// Both flags default to true when omitted; the server makes requested and agent roles agent-only
const isAssignableToMembersOrApiKeys = ({
  canBeAssignedToUsers,
  canBeAssignedToApiKeys,
}: Pick<
  LegacyCompliantRoleManifest,
  'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
>) => canBeAssignedToUsers !== false || canBeAssignedToApiKeys !== false;

// Rule 8 of the confined app grants design (twentyhq/core-team-issues#3139)
export const getApplicationManifestRoleViolations = ({
  manifest,
}: {
  manifest: Pick<ApplicationManifestRoleSources, 'agents'> & {
    application: Pick<
      ApplicationManifest,
      'universalIdentifier' | 'defaultRoleUniversalIdentifier'
    >;
    roles: LegacyCompliantRoleManifest[];
  };
}): ApplicationManifestRoleViolation[] => {
  const { roleKindsByUniversalIdentifier } = classifyApplicationManifestRoles({
    manifest,
  });

  return manifest.roles.flatMap((role): ApplicationManifestRoleViolation[] => {
    const roleReference = {
      roleUniversalIdentifier: role.universalIdentifier,
      roleLabel: role.label,
    };
    const roleKinds =
      roleKindsByUniversalIdentifier.get(role.universalIdentifier) ?? [];
    const standaloneRoleViolations: ApplicationManifestRoleViolation[] =
      !isNonEmptyArray(roleKinds) && isAssignableToMembersOrApiKeys(role)
        ? [{ ...roleReference, kind: 'standaloneRole' }]
        : [];

    const { objects } = normalizeLegacyCompliantRoleManifest({
      role,
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
    }).recordsPermissions;

    return [
      ...standaloneRoleViolations,
      ...(
        [
          ['rowLevelRules', hasRowLevelRules],
          ['fieldPermissions', hasFieldPermissions],
        ] as const
      ).flatMap(([kind, isDeclaredOnObject]) => {
        const objectUniversalIdentifiers = objects
          .filter(isDeclaredOnObject)
          .map((object) => object.objectUniversalIdentifier);

        return isNonEmptyArray(objectUniversalIdentifiers)
          ? [{ ...roleReference, kind, roleKinds, objectUniversalIdentifiers }]
          : [];
      }),
    ];
  });
};

export const formatApplicationManifestRoleViolation = (
  violation: ApplicationManifestRoleViolation,
): string => {
  const role = doNotTranslate(
    `Role "${violation.roleLabel}" (${violation.roleUniversalIdentifier})`,
  );

  if (violation.kind === 'standaloneRole') {
    return doNotTranslate(
      `${role} is neither the application role nor an agent role, and can be assigned to members or API keys. Set canBeAssignedToUsers and canBeAssignedToApiKeys to false so that only agents can hold it.`,
    );
  }

  const declared =
    violation.kind === 'rowLevelRules'
      ? 'row-level rules'
      : 'field permissions';

  const roleKinds = isNonEmptyArray(violation.roleKinds)
    ? violation.roleKinds
        .map((roleKind) => (roleKind === 'requested' ? 'application' : 'agent'))
        .join(' and ')
    : 'standalone';

  return doNotTranslate(
    `${role}, the ${roleKinds} role, declares ${declared} on objects ${violation.objectUniversalIdentifiers.join(', ')}. Marketplace applications cannot declare ${declared}: the workspace configures them.`,
  );
};
