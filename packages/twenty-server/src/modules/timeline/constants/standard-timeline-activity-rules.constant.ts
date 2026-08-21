import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';

type StandardTimelineActivityRule = {
  objectUniversalIdentifier: string;
  relationFieldUniversalIdentifier: string;
  actions: TimelineActivityRuleAction[];
  triggerFieldUniversalIdentifiers: string[] | null;
};

// Activity fan-out is not derived from metadata: deriving one rule per junction
// relation would silently switch on every junction, messageList.members
// included. Notes and tasks are declared instead.
export const STANDARD_TIMELINE_ACTIVITY_RULES: StandardTimelineActivityRule[] =
  [
    {
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      relationFieldUniversalIdentifier:
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
      actions: ['updated', 'linked', 'unlinked'],
      triggerFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.note.fields.title.universalIdentifier,
      ],
    },
    {
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
      relationFieldUniversalIdentifier:
        STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
      actions: ['updated', 'linked', 'unlinked'],
      triggerFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.task.fields.title.universalIdentifier,
      ],
    },
  ];
