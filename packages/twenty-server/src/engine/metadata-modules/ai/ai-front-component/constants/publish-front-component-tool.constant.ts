import { PUBLISH_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export const PUBLISH_FRONT_COMPONENT_TOOL = {
  name: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  approval: { template: 'frontComponent' },
} as const satisfies Pick<ToolIndexEntry, 'name' | 'approval'>;
