import { type TimelineActivityAction } from './TimelineActivityAction';

export type TimelineActivityTypeSnapshot = {
  id: string;
  universalIdentifier: string;
  name: string;
  label: string;
  action: TimelineActivityAction | null;
  icon: string | null;
  objectUniversalIdentifier: string | null;
  frontComponentUniversalIdentifier: string | null;
};
