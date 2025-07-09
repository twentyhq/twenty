import { DataSource } from 'typeorm';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import {
    SEED_APPLE_WORKSPACE_ID,
    SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

const agentTableName = 'agent';
const workspaceTableName = 'workspace';

export const AGENT_DATA_SEED_IDS = {
  APPLE_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000001',
  YCOMBINATOR_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000002',
};

export const seedAgents = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  let agentId: string;
  let agentName: string;
  let agentDescription: string;

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    agentId = AGENT_DATA_SEED_IDS.APPLE_DEFAULT_AGENT;
    agentName = 'Apple AI Assistant';
    agentDescription = 'AI assistant for Apple workspace to help with tasks, insights, and workflow guidance';
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    agentId = AGENT_DATA_SEED_IDS.YCOMBINATOR_DEFAULT_AGENT;
    agentName = 'YC AI Assistant';
    agentDescription = 'AI assistant for YCombinator workspace to help with tasks, insights, and workflow guidance';
  } else {
    throw new Error(`Unsupported workspace ID for agent seeding: ${workspaceId}`);
  }

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentTableName}`, [
      'id',
      'name',
      'description',
      'prompt',
      'modelId',
      'responseFormat',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      {
        id: agentId,
        name: agentName,
        description: agentDescription,
        prompt:
          'You are a helpful AI assistant for this workspace. Help users with their tasks, provide insights about their data, and guide them through workflows. Be concise but thorough in your responses.',
        modelId: 'gpt-4o' as ModelId,
        responseFormat: null,
        workspaceId,
      },
    ])
    .execute();

  await dataSource
    .createQueryBuilder()
    .update(`${schemaName}.${workspaceTableName}`)
    .set({ defaultAgentId: agentId })
    .where('id = :workspaceId', { workspaceId })
    .execute();
};
