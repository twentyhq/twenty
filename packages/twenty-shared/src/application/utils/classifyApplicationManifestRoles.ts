import { type Manifest } from '@/application/manifestType';
import { isDefined } from '@/utils/validation/isDefined';

export type ApplicationManifestRoleKind = 'requested' | 'agent';

export type ClassifiedApplicationManifestRoles = {
  roleKindsByUniversalIdentifier: Map<string, ApplicationManifestRoleKind[]>;
  standaloneRoleUniversalIdentifiers: Set<string>;
};

// A defineRole() role an agent uses is an agent role, not a standalone one
export const classifyApplicationManifestRoles = ({
  manifest,
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
}): ClassifiedApplicationManifestRoles => {
  const agentRoleUniversalIdentifiers = new Set(
    manifest.agents
      .map((agent) => agent.roleUniversalIdentifier)
      .filter(isDefined),
  );
  const roleKindsByUniversalIdentifier = new Map<
    string,
    ApplicationManifestRoleKind[]
  >();
  const standaloneRoleUniversalIdentifiers = new Set<string>();

  for (const { universalIdentifier } of manifest.roles) {
    const roleKinds: ApplicationManifestRoleKind[] = [
      ...(universalIdentifier ===
      manifest.application.defaultRoleUniversalIdentifier
        ? (['requested'] as const)
        : []),
      ...(agentRoleUniversalIdentifiers.has(universalIdentifier)
        ? (['agent'] as const)
        : []),
    ];

    if (roleKinds.length === 0) {
      standaloneRoleUniversalIdentifiers.add(universalIdentifier);
    } else {
      roleKindsByUniversalIdentifier.set(universalIdentifier, roleKinds);
    }
  }

  return { roleKindsByUniversalIdentifier, standaloneRoleUniversalIdentifiers };
};
