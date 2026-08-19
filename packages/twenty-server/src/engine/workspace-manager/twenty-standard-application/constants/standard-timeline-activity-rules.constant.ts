import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

type StandardTimelineActivityRuleDefinition<
  O extends AllStandardObjectName = AllStandardObjectName,
> = {
  objectName: O;
  relationFieldName: AllStandardObjectFieldName<O>;
  actions: TimelineActivityAction[];
  triggerFieldNames: AllStandardObjectFieldName<O>[];
};

// Activity fan-out is not derived from metadata: deriving one rule per junction
// relation would silently switch on every junction, messageList.members
// included. Notes and tasks are declared instead.
export const STANDARD_TIMELINE_ACTIVITY_RULES = [
  {
    objectName: 'note',
    relationFieldName: 'noteTargets',
    actions: ['updated', 'linked', 'unlinked'],
    triggerFieldNames: ['title'],
  } satisfies StandardTimelineActivityRuleDefinition<'note'>,
  {
    objectName: 'task',
    relationFieldName: 'taskTargets',
    actions: ['updated', 'linked', 'unlinked'],
    triggerFieldNames: ['title'],
  } satisfies StandardTimelineActivityRuleDefinition<'task'>,
] as const;
