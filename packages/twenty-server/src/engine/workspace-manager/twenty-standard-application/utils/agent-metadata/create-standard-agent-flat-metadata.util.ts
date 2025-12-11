import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/modelConfiguration';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type CreateStandardAgentContext = {
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

export type CreateStandardAgentArgs = {
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
  context: CreateStandardAgentContext;
  standardAgentRelatedEntityIds: Record<string, { id: string }>;
  agentName: string;
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
  standardAgentRelatedEntityIds,
  agentName,
}: CreateStandardAgentArgs): FlatAgent => ({
  id: standardAgentRelatedEntityIds[agentName].id,
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

