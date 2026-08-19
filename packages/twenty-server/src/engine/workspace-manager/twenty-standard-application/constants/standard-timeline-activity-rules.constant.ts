import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

type StandardTimelineActivityRuleDeclaration<
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
const STANDARD_TIMELINE_ACTIVITY_RULE_DECLARATIONS = [
  {
    objectName: 'note',
    relationFieldName: 'noteTargets',
    actions: ['updated', 'linked', 'unlinked'],
    triggerFieldNames: ['title'],
  } satisfies StandardTimelineActivityRuleDeclaration<'note'>,
  {
    objectName: 'task',
    relationFieldName: 'taskTargets',
    actions: ['updated', 'linked', 'unlinked'],
    triggerFieldNames: ['title'],
  } satisfies StandardTimelineActivityRuleDeclaration<'task'>,
];

export type StandardTimelineActivityRuleDefinition = {
  objectName: AllStandardObjectName;
  relationFieldName: string;
  actions: TimelineActivityAction[];
  triggerFieldNames: string[];
  objectUniversalIdentifier: string;
  relationFieldUniversalIdentifier: string;
  triggerFieldUniversalIdentifiers: string[];
};

// The declarations resolved once against STANDARD_OBJECTS, so every consumer
// reads the same universal identifiers instead of re-deriving them.
export const STANDARD_TIMELINE_ACTIVITY_RULES: StandardTimelineActivityRuleDefinition[] =
  STANDARD_TIMELINE_ACTIVITY_RULE_DECLARATIONS.map((declaration) => {
    const objectDefinition = STANDARD_OBJECTS[declaration.objectName];
    const objectFields = objectDefinition.fields as Record<
      string,
      { universalIdentifier: string }
    >;

    return {
      ...declaration,
      objectUniversalIdentifier: objectDefinition.universalIdentifier,
      relationFieldUniversalIdentifier:
        objectFields[declaration.relationFieldName].universalIdentifier,
      triggerFieldUniversalIdentifiers: declaration.triggerFieldNames.map(
        (triggerFieldName) =>
          objectFields[triggerFieldName].universalIdentifier,
      ),
    };
  });
