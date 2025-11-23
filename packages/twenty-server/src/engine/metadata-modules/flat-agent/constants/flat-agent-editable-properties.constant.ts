import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export const FLAT_AGENT_EDITABLE_PROPERTIES = [
  'name',
  'label',
  'icon',
  'description',
  'prompt',
  'modelId',
  'responseFormat',
  'modelConfiguration',
] as const satisfies (keyof FlatAgent)[];

