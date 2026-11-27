import { EventEmitter2 } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'twenty-shared/database-events';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
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
  const emitCreatedEvents = (events: ObjectRecordCreateEvent[]) => {
    const eventEmitter = new EventEmitter2();
    const receivedBatches: WorkspaceEventBatch<ObjectRecordCreateEvent>[] = [];

    eventEmitter.on(
      'company.created',
      (batch: WorkspaceEventBatch<ObjectRecordCreateEvent>) =>
        receivedBatches.push(batch),
    );

    new WorkspaceEventEmitter(eventEmitter).emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'company',
      action: DatabaseEventAction.CREATED,
      events,
      objectMetadata: getFlatObjectMetadataMock({
        id: 'company-id',
        universalIdentifier: 'company-id',
        nameSingular: 'company',
        namePlural: 'companies',
        workspaceId: 'workspace-id',
      }),
      workspaceId: 'workspace-id',
    });

    expect(receivedBatches).toHaveLength(1);

    return receivedBatches[0].events;
  };

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
