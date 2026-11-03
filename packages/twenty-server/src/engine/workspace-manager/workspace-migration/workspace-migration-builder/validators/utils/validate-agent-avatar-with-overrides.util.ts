import { isDefined } from 'twenty-shared/utils';

import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';
import { validateAgentAvatar } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-avatar.util';

type AgentAvatar = Parameters<typeof validateAgentAvatar>[0];

export const validateAgentAvatarWithOverrides = ({
  agent,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  agent: AgentAvatar & { overrides?: unknown };
  workspaceCustomApplicationUniversalIdentifier: string;
}): ReturnType<typeof validateAgentAvatar> => {
  const authoredOverrides = normalizeAuthoredOverrides<AgentAvatar>({
    metadataName: 'agent',
    overrides: agent.overrides,
    workspaceCustomApplicationUniversalIdentifier,
  });

  return [
    agent,
    ...Object.values(authoredOverrides ?? {}).filter(isDefined),
  ].flatMap(validateAgentAvatar);
};
