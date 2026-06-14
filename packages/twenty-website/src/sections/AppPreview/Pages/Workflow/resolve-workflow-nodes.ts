import {
  IconClock,
  IconCode,
  IconFilter,
  IconMail,
  IconPlug,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconSitemap,
} from '@tabler/icons-react';

import type { WorkflowNodeDef } from '../../types';
import type { WorkflowNodeDefinition } from './workflow-page-data';
import { WORKFLOW_PAGE_COLORS } from './workflow-page-theme';

const ICON_MAP: Record<string, typeof IconPlug> = {
  clock: IconClock,
  code: IconCode,
  filter: IconFilter,
  mail: IconMail,
  plug: IconPlug,
  plus: IconPlus,
  repeat: IconRepeat,
  search: IconSearch,
  sitemap: IconSitemap,
};

export function resolveWorkflowNodes(
  defs: WorkflowNodeDef[],
): WorkflowNodeDefinition[] {
  return defs.map((def) => ({
    id: def.id,
    x: def.x,
    y: def.y,
    width: def.width,
    label: def.label,
    title: def.title,
    Icon: ICON_MAP[def.iconName] ?? IconCode,
    iconColor: def.iconColor ?? WORKFLOW_PAGE_COLORS.nodeActionIcon,
  }));
}
