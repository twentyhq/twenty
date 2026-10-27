import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

type AgentWithOverrides = Pick<AgentEntity, 'overrides'> & {
  isActive?: boolean;
  applicationUniversalIdentifier?: string;
};

// Takes repository rows as well as flat agents: a row has no application
// universal identifier, which only orders the owner's own entry last. The
// isActive column stays hidden until its 2.53 instance command has run.
export const resolveEffectiveAgent = <TAgent extends AgentWithOverrides>(
  agent: TAgent,
): TAgent =>
  ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME.agent.reduce<TAgent>(
    (effectiveAgent, property) => {
      const overrideValue = readAuthoredOverrideProperty({
        metadataName: 'agent',
        overrides: agent.overrides,
        path: [property],
        authorContext: {
          ownerApplicationUniversalIdentifier:
            agent.applicationUniversalIdentifier,
        },
      });

      return overrideValue === undefined
        ? effectiveAgent
        : { ...effectiveAgent, [property]: overrideValue };
    },
    { ...agent, isActive: agent.isActive ?? true },
  );
