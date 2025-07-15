import { EventEmitter2 } from '@nestjs/event-emitter';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const mockObjectMetadata = {
  id: 'obj-1',
  workspaceId: 'ws-1',
  nameSingular: 'testObject',
  namePlural: 'testObjects',
  labelSingular: 'Test Object',
  labelPlural: 'Test Objects',
  icon: 'icon',
  targetTableName: 'test_table',
  fieldsById: {
    'field-1': {
      id: 'field-1',
      type: 'string',
      name: 'name',
      label: 'Name',
      objectMetadataId: 'obj-1',
      isNullable: false,
      isLabelSyncedWithName: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  fieldIdByJoinColumnName: {},
  fieldIdByName: {},
  indexMetadatas: [],
  isSystem: false,
  isCustom: false,
  isActive: true,
  isRemote: false,
  isAuditLogged: true,
  isSearchable: true,
};

const mockEntity = { id: 'entity-1', name: 'Entity Name' };
const mockEntityUpdated = { id: 'entity-1', name: 'Entity Name Updated' };

const workspaceId = 'ws-1';

describe('WorkspaceEventEmitter', () => {
  let eventEmitter2: EventEmitter2;
  let workspaceEventEmitter: WorkspaceEventEmitter;

  beforeEach(() => {
    eventEmitter2 = { emit: jest.fn() } as any;
    workspaceEventEmitter = new WorkspaceEventEmitter(eventEmitter2);
  });

  describe('emitMutationEvent', () => {
    it('should emit created event', async () => {
      await workspaceEventEmitter.emitMutationEvent({
        action: DatabaseEventAction.CREATED,
        objectMetadata: mockObjectMetadata as any,
        workspaceId,
        entities: mockEntity,
      });
      expect(eventEmitter2.emit).toHaveBeenCalledWith(
        'testObject.created',
        expect.objectContaining({
          name: 'testObject.created',
          workspaceId,
          events: [
            expect.objectContaining({
              recordId: 'entity-1',
              properties: { after: mockEntity },
            }),
          ],
        }),
      );
    });

    it('should emit updated event', async () => {
      await workspaceEventEmitter.emitMutationEvent({
        action: DatabaseEventAction.UPDATED,
        objectMetadata: mockObjectMetadata as any,
        workspaceId,
        entities: mockEntityUpdated,
        beforeEntities: mockEntity,
      });
      expect(eventEmitter2.emit).toHaveBeenCalledWith(
        'testObject.updated',
        expect.objectContaining({
          name: 'testObject.updated',
          workspaceId,
          events: [
            expect.objectContaining({
              recordId: 'entity-1',
              properties: expect.objectContaining({
                before: mockEntity,
                after: mockEntityUpdated,
                updatedFields: ['name'],
              }),
            }),
          ],
        }),
      );
    });

    it('should emit deleted event', async () => {
      await workspaceEventEmitter.emitMutationEvent({
        action: DatabaseEventAction.DELETED,
        objectMetadata: mockObjectMetadata as any,
        workspaceId,
        entities: mockEntity,
      });
      expect(eventEmitter2.emit).toHaveBeenCalledWith(
        'testObject.deleted',
        expect.objectContaining({
          name: 'testObject.deleted',
          workspaceId,
          events: [
            expect.objectContaining({
              recordId: 'entity-1',
              properties: { before: mockEntity },
            }),
          ],
        }),
      );
    });

    it('should not emit for unknown action', async () => {
      await workspaceEventEmitter.emitMutationEvent({
        action: 'unknown' as any,
        objectMetadata: mockObjectMetadata as any,
        workspaceId,
        entities: mockEntity,
      });
      expect(eventEmitter2.emit).not.toHaveBeenCalled();
    });
  });

  describe('emitDatabaseBatchEvent', () => {
    it('should emit batch event', () => {
      workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'testObject',
        action: DatabaseEventAction.CREATED,
        events: [
          {
            recordId: 'entity-1',
            objectMetadata: mockObjectMetadata as any,
            properties: { after: mockEntity },
          },
        ],
        workspaceId,
      });
      expect(eventEmitter2.emit).toHaveBeenCalledWith(
        'testObject.created',
        expect.objectContaining({
          name: 'testObject.created',
          workspaceId,
          events: [
            expect.objectContaining({
              recordId: 'entity-1',
              properties: { after: mockEntity },
            }),
          ],
        }),
      );
    });
    it('should not emit if events array is empty', () => {
      workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'testObject',
        action: DatabaseEventAction.CREATED,
        events: [],
        workspaceId,
      });
      expect(eventEmitter2.emit).not.toHaveBeenCalled();
    });
  });

  describe('emitCustomBatchEvent', () => {
    it('should emit custom batch event', () => {
      workspaceEventEmitter.emitCustomBatchEvent(
        'custom_event' as any,
        [{ foo: 'bar' }],
        workspaceId,
      );
      expect(eventEmitter2.emit).toHaveBeenCalledWith(
        'custom_event',
        expect.objectContaining({
          name: 'custom_event',
          workspaceId,
          events: [expect.objectContaining({ foo: 'bar' })],
        }),
      );
    });
    it('should not emit if events array is empty', () => {
      workspaceEventEmitter.emitCustomBatchEvent(
        'custom_event' as any,
        [],
        workspaceId,
      );
      expect(eventEmitter2.emit).not.toHaveBeenCalled();
    });
  });
});
