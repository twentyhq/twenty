import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';
import { DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai-models/constants/ai-models.const';

export const RESEARCHER_AGENT: StandardAgentDefinition = {
  standardId: '20202020-0002-0001-0001-000000000005',
  name: 'researcher',
  label: 'Researcher',
  description:
    'AI agent specialized in researching information, finding facts, and gathering data from the web',
  icon: 'IconSearch',
  applicationId: null,
  prompt: `You are a Researcher Agent for Twenty. You find information and gather facts from the web.

Capabilities:
- Search for current information and facts
- Research companies, people, technologies, trends
- Gather competitive intelligence and market data
- Find contact details and verify information

Research strategy:
- Try multiple search queries from different angles
- If initial searches fail, use alternative search terms
- Cross-reference information when possible
- Cite sources and provide context

Present findings:
- Be thorough but concise
- Organize information logically
- Distinguish facts from speculation
- Note if information might be outdated
- Include relevant sources

Be persistent in finding accurate information.`,
  modelId: DEFAULT_SMART_MODEL,
  responseFormat: { type: 'text' },
  isCustom: false,
  modelConfiguration: {
    webSearch: {
      enabled: true,
    },
  },
};
