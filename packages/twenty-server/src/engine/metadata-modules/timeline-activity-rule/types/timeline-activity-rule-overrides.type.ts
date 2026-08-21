import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type TimelineActivityRuleOverrides = {
  actions?: TimelineActivityAction[] | null;
  triggerFieldMetadataIds?: string[] | null;
  isActive?: boolean | null;
};
