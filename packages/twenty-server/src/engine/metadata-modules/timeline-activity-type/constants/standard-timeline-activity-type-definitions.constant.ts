import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type StandardTimelineActivityTypeDefinition = {
  name: string;
  universalIdentifier: string;
  label: MessageDescriptor;
  action: TimelineActivityAction;
  icon: string | null;
};

// One type per rule action. The stored `name` column these replace conflated the
// action with the source object and could not tell a linked record being
// deleted from the link itself being removed.
export const STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS: StandardTimelineActivityTypeDefinition[] =
  [
    {
      name: 'recordCreated',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c01',
      label: msg({
        message: `was created by`,
        context: 'timelineActivityType.label',
      }),
      action: 'created',
      icon: 'IconCirclePlus',
    },
    {
      name: 'recordUpdated',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c02',
      label: msg({
        message: `updated`,
        context: 'timelineActivityType.label',
      }),
      action: 'updated',
      icon: 'IconEditCircle',
    },
    {
      name: 'recordDeleted',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c03',
      label: msg({
        message: `was deleted by`,
        context: 'timelineActivityType.label',
      }),
      action: 'deleted',
      icon: 'IconTrash',
    },
    {
      name: 'recordRestored',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c04',
      label: msg({
        message: `was restored by`,
        context: 'timelineActivityType.label',
      }),
      action: 'restored',
      icon: 'IconRestore',
    },
    {
      name: 'recordLinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c05',
      label: msg({
        message: `was linked by`,
        context: 'timelineActivityType.label',
      }),
      action: 'linked',
      icon: 'IconLink',
    },
    {
      name: 'recordUnlinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c06',
      label: msg({
        message: `was unlinked by`,
        context: 'timelineActivityType.label',
      }),
      action: 'unlinked',
      icon: 'IconUnlink',
    },
  ];
