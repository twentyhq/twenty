import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type TimelineActivityAction,
  type TimelineActivityRenderer,
} from 'twenty-shared/timeline';

export type StandardTimelineActivityTypeDefinition = {
  name: string;
  universalIdentifier: string;
  label: MessageDescriptor;
  action: TimelineActivityAction | null;
  icon: string | null;
  renderer: TimelineActivityRenderer | null;
  objectUniversalIdentifier: string | null;
};

// The vocabulary a timeline row is stamped from. Types carrying an object are
// preferred for events about that object's records, so a note link renders
// through its own component; the ones carrying none are the fallback for every
// other object and for a record's own changes. The stored `name` column these
// replace conflated the action with the source object and could not tell a
// linked record being deleted from the link itself being removed.
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
      renderer: null,
      objectUniversalIdentifier: null,
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
      renderer: null,
      objectUniversalIdentifier: null,
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
      renderer: null,
      objectUniversalIdentifier: null,
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
      renderer: null,
      objectUniversalIdentifier: null,
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
      renderer: null,
      objectUniversalIdentifier: null,
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
      renderer: null,
      objectUniversalIdentifier: null,
    },
    {
      name: 'noteLinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c09',
      label: msg({
        message: `linked a related note`,
        context: 'timelineActivityType.label',
      }),
      action: 'linked',
      icon: 'IconLink',
      renderer: 'activity',
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    },
    {
      name: 'noteUnlinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0a',
      label: msg({
        message: `unlinked a related note`,
        context: 'timelineActivityType.label',
      }),
      action: 'unlinked',
      icon: 'IconUnlink',
      renderer: 'activity',
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    },
    {
      name: 'noteUpdated',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0b',
      label: msg({
        message: `updated a related note`,
        context: 'timelineActivityType.label',
      }),
      action: 'updated',
      icon: 'IconEditCircle',
      renderer: 'activity',
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    },
    {
      name: 'taskLinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0c',
      label: msg({
        message: `linked a related task`,
        context: 'timelineActivityType.label',
      }),
      action: 'linked',
      icon: 'IconLink',
      renderer: 'activity',
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
    },
    {
      name: 'taskUnlinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0d',
      label: msg({
        message: `unlinked a related task`,
        context: 'timelineActivityType.label',
      }),
      action: 'unlinked',
      icon: 'IconUnlink',
      renderer: 'activity',
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
    },
    {
      name: 'taskUpdated',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0e',
      label: msg({
        message: `updated a related task`,
        context: 'timelineActivityType.label',
      }),
      action: 'updated',
      icon: 'IconEditCircle',
      renderer: 'activity',
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
    },
    {
      name: 'messageLinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0f',
      label: msg({
        message: `sent or received an email`,
        context: 'timelineActivityType.label',
      }),
      action: 'linked',
      icon: 'IconMail',
      renderer: 'message',
      objectUniversalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
    },
    {
      name: 'calendarEventLinked',
      universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c10',
      label: msg({
        message: `attended a calendar event`,
        context: 'timelineActivityType.label',
      }),
      action: 'linked',
      icon: 'IconCalendar',
      renderer: 'calendarEvent',
      objectUniversalIdentifier:
        STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    },
  ];
