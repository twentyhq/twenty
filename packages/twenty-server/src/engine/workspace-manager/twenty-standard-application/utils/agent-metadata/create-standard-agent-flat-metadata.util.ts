import { v4 } from 'uuid';

import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/model-configuration.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.constant';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardAgentContext = {
  agentName: AllStandardAgentName;
  name: string;
  label: string;
  icon: string | null;
  description: string | null;
  prompt: string;
  modelId: ModelId;
  responseFormat: AgentResponseFormat;
  isCustom: boolean;
  isSystem: boolean;
  modelConfiguration: ModelConfiguration | null;
};

export type CreateStandardAgentArgs = StandardBuilderArgs<'agent'> & {
  context: CreateStandardAgentContext;
};

export const createStandardAgentFlatMetadata = ({
  context: {
    agentName,
    name,
    label,
    icon,
    description,
    prompt,
    modelId,
    responseFormat,
    isCustom,
    isSystem,
    modelConfiguration,
  },
  workspaceId,
  twentyStandardApplicationId,
  now,
}: CreateStandardAgentArgs): FlatAgent => {
  const universalIdentifier = STANDARD_AGENT[agentName].universalIdentifier;

  return {
    id: v4(),
    universalIdentifier,
    name,
    label,
    icon,
    description,
    prompt,
    modelId,
    responseFormat,
    isCustom,
    isSystem,
    modelConfiguration,
    workspaceId,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
