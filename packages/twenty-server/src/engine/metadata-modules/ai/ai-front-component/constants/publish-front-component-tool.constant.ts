import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export const PUBLISH_FRONT_COMPONENT_TOOL = {
  name: 'publish_front_component',
  approval: { template: 'generic', areArgumentsEditable: false },
} as const satisfies Pick<ToolIndexEntry, 'name' | 'approval'>;
