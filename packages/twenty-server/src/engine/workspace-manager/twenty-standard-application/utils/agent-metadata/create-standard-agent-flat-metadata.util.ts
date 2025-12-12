import { v4 } from 'uuid';

import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/modelConfiguration';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardAgentContext = {
  agentName: AllStandardAgentName;
  universalIdentifier: string;
  standardId: string;
  name: string;
  label: string;
  icon: string | null;
  description: string | null;
  prompt: string;
  modelId: ModelId;
  responseFormat: AgentResponseFormat;
  isCustom: boolean;
  modelConfiguration: ModelConfiguration | null;
  evaluationInputs: string[];
};

export type CreateStandardAgentArgs = StandardBuilderArgs<'agent'> & {
  context: CreateStandardAgentContext;
};

export const createStandardAgentFlatMetadata = ({
  context: {
    universalIdentifier,
    standardId,
    name,
    label,
    icon,
    description,
    prompt,
    modelId,
    responseFormat,
    isCustom,
    modelConfiguration,
    evaluationInputs,
  },
  workspaceId,
  twentyStandardApplicationId,
  now,
}: CreateStandardAgentArgs): FlatAgent => ({
  id: v4(),
  universalIdentifier,
  standardId,
  name,
  label,
  icon,
  description,
  prompt,
  modelId,
  responseFormat,
  isCustom,
  modelConfiguration,
  evaluationInputs,
  workspaceId,
  applicationId: twentyStandardApplicationId,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});
