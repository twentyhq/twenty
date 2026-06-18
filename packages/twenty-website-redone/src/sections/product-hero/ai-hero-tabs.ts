import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type AiHeroTabIcon = 'kanban' | 'checklist' | 'chart' | 'workflow';

export type AiHeroTab = {
  body: MessageDescriptor;
  icon: AiHeroTabIcon;
};

// The four AI scenes the hero offers; index N selects product-visual
// scene N+1 (scene 0 is the collaborative intro).
export const AI_HERO_TABS: AiHeroTab[] = [
  {
    body: msg`Build a pipeline board grouped by stage`,
    icon: 'kanban',
  },
  {
    body: msg`Generate tasks for my top 10 accounts`,
    icon: 'checklist',
  },
  {
    body: msg`Build a dashboard of pipeline by stage`,
    icon: 'chart',
  },
  {
    body: msg`Draft a workflow for an email sequence`,
    icon: 'workflow',
  },
];
