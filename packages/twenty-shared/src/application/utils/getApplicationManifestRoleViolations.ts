import { type Manifest } from '@/application/manifestType';
import { type ObjectRecordsPermissionsManifest } from '@/application/roleManifestType';
import {
  type ApplicationManifestRoleKind,
  classifyApplicationManifestRoles,
} from '@/application/utils/classifyApplicationManifestRoles';
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

const hasFieldPermissions = (object: ObjectRecordsPermissionsManifest) =>
  [object, ...(object.rowLevelRecordsPermissions ?? [])].some(
    ({ unreadableFields, uneditableFields }) =>
      isNonEmptyArray(unreadableFields) || isNonEmptyArray(uneditableFields),
  );

// Rule 8 of the confined app grants design (twentyhq/core-team-issues#3139)
export const getApplicationManifestRoleViolations = ({
  manifest,
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
}): ApplicationManifestRoleViolation[] => {
  const { roleKindsByUniversalIdentifier } = classifyApplicationManifestRoles({
    manifest,
  });

  return manifest.roles.flatMap((role): ApplicationManifestRoleViolation[] => {
    const roleReference = {
      roleUniversalIdentifier: role.universalIdentifier,
      roleLabel: role.label,
    };
    const roleKinds = roleKindsByUniversalIdentifier.get(
      role.universalIdentifier,
    );

    if (!isNonEmptyArray(roleKinds)) {
      return [{ ...roleReference, kind: 'standaloneRole' }];
    }

    const { objects } = normalizeLegacyCompliantRoleManifest({
      role,
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
    }).recordsPermissions;

    return (
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
    });
  });
};

export const formatApplicationManifestRoleViolation = (
  violation: ApplicationManifestRoleViolation,
): string => {
  const role = `Role "${violation.roleLabel}" (${violation.roleUniversalIdentifier})`;

  if (violation.kind === 'standaloneRole') {
    return `${role} is neither the application role nor an agent role. Marketplace applications can only declare their application role and their agents' roles.`;
  }

  const declared =
    violation.kind === 'rowLevelRules'
      ? 'row-level rules'
      : 'field permissions';

  const roleKinds = violation.roleKinds
    .map((roleKind) => (roleKind === 'requested' ? 'application' : 'agent'))
    .join(' and ');

  return `${role}, the ${roleKinds} role, declares ${declared} on objects ${violation.objectUniversalIdentifiers.join(', ')}. Marketplace applications cannot declare ${declared}: the workspace configures them.`;
};
