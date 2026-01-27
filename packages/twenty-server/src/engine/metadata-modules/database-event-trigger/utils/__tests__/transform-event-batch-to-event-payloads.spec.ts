import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { transformEventBatchToEventPayloads } from 'src/engine/metadata-modules/database-event-trigger/utils/transform-event-batch-to-event-payloads';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const createMockServerlessFunction = (
  overrides: Partial<ServerlessFunctionEntity> = {},
): ServerlessFunctionEntity =>
  ({
    id: 'function-1',
    workspaceId: 'workspace-1',
    databaseEventTriggerSettings: {
      eventName: 'company.updated',
    },
    ...overrides,
  }) as ServerlessFunctionEntity;

const createMockEvent = (
  overrides: Partial<ObjectRecordEvent> = {},
): ObjectRecordEvent =>
  ({
    recordId: 'record-1',
    properties: {
      after: {},
    },
    ...overrides,
  }) as ObjectRecordEvent;

const createMockWorkspaceEventBatch = (
  overrides: Partial<WorkspaceEventBatch<ObjectRecordEvent>> = {},
): WorkspaceEventBatch<ObjectRecordEvent> => ({
  name: 'company.updated',
  workspaceId: 'workspace-1',
  objectMetadata: getFlatObjectMetadataMock({
    universalIdentifier: 'company-uuid',
    nameSingular: 'company',
  }),
  events: [createMockEvent()],
  ...overrides,
});

describe('transformEventBatchToEventPayloads', () => {
  describe('basic transformation', () => {
    it('should transform a single event batch with a single serverless function', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch();
      const serverlessFunctions = [createMockServerlessFunction()];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        serverlessFunctionId: 'function-1',
        workspaceId: 'workspace-1',
        payload: expect.objectContaining({
          name: 'company.updated',
          workspaceId: 'workspace-1',
          recordId: 'record-1',
        }),
      });
    });

    it('should create multiple payloads for multiple events in a batch', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [
          createMockEvent({ recordId: 'record-1' }),
          createMockEvent({ recordId: 'record-2' }),
          createMockEvent({ recordId: 'record-3' }),
        ],
      });
      const serverlessFunctions = [createMockServerlessFunction()];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(3);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-2', 'record-3']);
    });

    it('should create payloads for each serverless function', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch();
      const serverlessFunctions = [
        createMockServerlessFunction({
          id: 'function-1',
        }),
        createMockServerlessFunction({
          id: 'function-2',
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.serverlessFunctionId)).toEqual([
        'function-1',
        'function-2',
      ]);
    });
  });

  describe('updatedFields filtering', () => {
    it('should include all events when updatedFields is undefined', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const serverlessFunctions = [
        createMockServerlessFunction({
          databaseEventTriggerSettings: { eventName: 'company.updated' },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(2);
    });

    it('should include all events when updatedFields is empty array', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const serverlessFunctions = [
        createMockServerlessFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: [],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(2);
    });

    it('should filter events to only those matching updatedFields', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
          createMockEvent({
            recordId: 'record-3',
            properties: { after: {}, updatedFields: ['name', 'description'] },
          }),
        ],
      });
      const serverlessFunctions = [
        createMockServerlessFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-3']);
    });

    it('should filter events matching any of the specified updatedFields', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
          createMockEvent({
            recordId: 'record-3',
            properties: { after: {}, updatedFields: ['phone'] },
          }),
        ],
      });
      const serverlessFunctions = [
        createMockServerlessFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name', 'address'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-2']);
    });

    it('should return no events when none match the updatedFields filter', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const serverlessFunctions = [
        createMockServerlessFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['phone'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(0);
    });

    it('should handle different updatedFields filters per serverless function', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const serverlessFunctions = [
        createMockServerlessFunction({
          id: 'function-1',
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name'],
          },
        }),
        createMockServerlessFunction({
          id: 'function-2',
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['address'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(2);

      const function1Payloads = result.filter(
        (r) => r.serverlessFunctionId === 'function-1',
      );
      const function2Payloads = result.filter(
        (r) => r.serverlessFunctionId === 'function-2',
      );

      expect(function1Payloads).toHaveLength(1);
      expect((function1Payloads[0].payload as ObjectRecordEvent).recordId).toBe(
        'record-1',
      );

      expect(function2Payloads).toHaveLength(1);
      expect((function2Payloads[0].payload as ObjectRecordEvent).recordId).toBe(
        'record-2',
      );
    });
  });

  describe('edge cases', () => {
    it('should return empty array when no serverless functions provided', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch();

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions: [],
      });

      expect(result).toHaveLength(0);
    });

    it('should return empty array when no events in batch', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [],
      });
      const serverlessFunctions = [createMockServerlessFunction()];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        serverlessFunctions,
      });

      expect(result).toHaveLength(0);
    });
  });
});
