import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type StandardTimelineActivityTypeDefinition = {
  name: string;
  universalIdentifier: string;
  label: MessageDescriptor;
  action: TimelineActivityAction | null;
  icon: string | null;
  frontComponentUniversalIdentifier: string | null;
  objectUniversalIdentifier: string | null;
  targetRelationFieldUniversalIdentifier?: string;
  triggerFieldUniversalIdentifiers?: string[];
};

// The vocabulary a timeline row is stamped from. Types carrying an object are
// preferred for events about that object's records, so its label and icon can
// describe the linked object; the ones carrying none are the fallback for every
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
      frontComponentUniversalIdentifier: null,
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
      frontComponentUniversalIdentifier: null,
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
      frontComponentUniversalIdentifier: null,
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
      frontComponentUniversalIdentifier: null,
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
      frontComponentUniversalIdentifier: null,
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
      frontComponentUniversalIdentifier: null,
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
      triggerFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.note.fields.title.universalIdentifier,
      ],
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
      triggerFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.task.fields.title.universalIdentifier,
      ],
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.message.fields.messageParticipants.universalIdentifier,
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
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier:
        STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventParticipants
          .universalIdentifier,
    },
  ];
