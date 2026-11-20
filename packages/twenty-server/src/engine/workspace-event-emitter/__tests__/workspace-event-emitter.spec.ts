import { type EventEmitter2 } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'twenty-shared/database-events';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const buildCreateEvent = (recordId: string, eventId?: string) =>
  Object.assign(new ObjectRecordCreateEvent(), {
    recordId,
    properties: { after: { id: recordId } },
    ...(eventId !== undefined && { eventId }),
  });

describe('WorkspaceEventEmitter', () => {
  const emit = jest.fn();
  const workspaceEventEmitter = new WorkspaceEventEmitter({
    emit,
  } as unknown as EventEmitter2);

  const emitCreatedEvents = (events: ObjectRecordCreateEvent[]) => {
    workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'company',
      action: DatabaseEventAction.CREATED,
      events,
      objectMetadata: {} as FlatObjectMetadata,
      workspaceId: 'workspace-id',
    });

    const [, batch] = emit.mock.calls.at(-1) as [
      string,
      WorkspaceEventBatch<ObjectRecordCreateEvent>,
    ];

    return batch.events;
  };

  beforeEach(() => emit.mockClear());

  it('should give each emitted event its own event id', () => {
    const events = emitCreatedEvents([
      buildCreateEvent('record-1'),
      buildCreateEvent('record-2'),
    ]);

    expect(events[0].eventId).toEqual(expect.any(String));
    expect(events[1].eventId).toEqual(expect.any(String));
    expect(events[0].eventId).not.toBe(events[1].eventId);
  });

  it('should keep an event id the producer already set', () => {
    const [event] = emitCreatedEvents([
      buildCreateEvent('record-1', 'existing-event-id'),
    ]);

    expect(event.eventId).toBe('existing-event-id');
  });
});
