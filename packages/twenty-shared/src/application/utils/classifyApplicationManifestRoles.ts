import { type AgentManifest } from '@/application/agentManifestType';
import { type ApplicationManifest } from '@/application/applicationType';
import { type LegacyCompliantRoleManifest } from '@/application/roleManifestType';
import { isDefined } from '@/utils/validation/isDefined';

export type ApplicationManifestRoleKind = 'requested' | 'agent';

export type ClassifiedApplicationManifestRoles = {
  roleKindsByUniversalIdentifier: Map<string, ApplicationManifestRoleKind[]>;
  standaloneRoleUniversalIdentifiers: Set<string>;
};

export type ApplicationManifestRoleSources = {
  application: Pick<ApplicationManifest, 'defaultRoleUniversalIdentifier'>;
  roles: Pick<LegacyCompliantRoleManifest, 'universalIdentifier'>[];
  agents: Pick<AgentManifest, 'roleUniversalIdentifier'>[];
};

export const classifyApplicationManifestRoles = ({
  manifest,
}: {
  manifest: ApplicationManifestRoleSources;
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
