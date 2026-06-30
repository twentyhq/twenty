import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { resolveOverridableEntityEventBatchOverrides } from 'src/engine/subscriptions/metadata-event/utils/sanitize-overridable-entity-event-batch.util';

const makeViewFieldRecord = (
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> => ({
  id: 'vf-1',
  workspaceId: 'ws-1',
  applicationId: 'app-1',
  universalIdentifier: 'uid-1',
  isVisible: true,
  size: 200,
  position: 0,
  aggregateOperation: null,
  viewFieldGroupId: null,
  fieldMetadataId: 'fm-1',
  viewId: 'view-1',
  isActive: true,
  overrides: null,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  deletedAt: null,
  ...overrides,
});

const makeBatch = (
  metadataName: string,
  events: Record<string, unknown>[],
): MetadataEventBatch =>
  ({
    name: `metadata.${metadataName}.updated`,
    workspaceId: 'ws-1',
    metadataName,
    type: 'updated',
    events,
  }) as MetadataEventBatch;

describe('resolveOverridableEntityEventBatchOverrides', () => {
  describe('non-overridable entity (pass-through)', () => {
    it('should return the batch unchanged for entities without overrides config', () => {
      const batch = makeBatch('view', [
        {
          type: 'updated',
          metadataName: 'view',
          recordId: 'v-1',
          properties: {
            updatedFields: ['name'],
            diff: { name: { before: 'old', after: 'new' } },
            before: { id: 'v-1', name: 'old' },
            after: { id: 'v-1', name: 'new' },
          },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      expect(result).toBe(batch);
    });
  });

  describe('override resolution', () => {
    it('should resolve overrides into base properties and strip overrides but keep isActive', () => {
      const after = makeViewFieldRecord({
        isVisible: true,
        overrides: { isVisible: false },
      });

      const batch = makeBatch('viewField', [
        {
          type: 'created',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: { after },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.isVisible).toBe(false);
      expect(createdRecord).not.toHaveProperty('overrides');
      expect(createdRecord).toHaveProperty('isActive', true);
    });

    it('should strip overrides but keep isActive even when overrides is null', () => {
      const after = makeViewFieldRecord({ overrides: null });

      const batch = makeBatch('viewField', [
        {
          type: 'created',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: { after },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.isVisible).toBe(true);
      expect(createdRecord).not.toHaveProperty('overrides');
      expect(createdRecord).toHaveProperty('isActive', true);
    });

    it('should resolve multiple override properties', () => {
      const after = makeViewFieldRecord({
        isVisible: true,
        size: 200,
        position: 0,
        overrides: { isVisible: false, size: 300, position: 5 },
      });

      const batch = makeBatch('viewField', [
        {
          type: 'created',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: { after },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.isVisible).toBe(false);
      expect(createdRecord.size).toBe(300);
      expect(createdRecord.position).toBe(5);
    });

    it('should resolve overrides on both before and after for update events', () => {
      const before = makeViewFieldRecord({
        isVisible: true,
        overrides: null,
      });
      const after = makeViewFieldRecord({
        isVisible: true,
        overrides: { isVisible: false },
      });

      const batch = makeBatch('viewField', [
        {
          type: 'updated',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: {
            updatedFields: ['overrides'],
            diff: {},
            before,
            after,
          },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      const event = result.events[0] as {
        properties: {
          before: Record<string, unknown>;
          after: Record<string, unknown>;
        };
      };

      expect(event.properties.before.isVisible).toBe(true);
      expect(event.properties.after.isVisible).toBe(false);
    });

    it('should resolve overrides on before for delete events', () => {
      const before = makeViewFieldRecord({
        isVisible: true,
        overrides: { isVisible: false },
      });

      const batch = makeBatch('viewField', [
        {
          type: 'deleted',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: { before },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      const deletedRecord = (
        result.events[0] as { properties: { before: Record<string, unknown> } }
      ).properties.before;

      expect(deletedRecord.isVisible).toBe(false);
      expect(deletedRecord).not.toHaveProperty('overrides');
      expect(deletedRecord).toHaveProperty('isActive', true);
    });
  });

  describe('pageLayoutWidget (another overridable entity)', () => {
    it('should resolve overrides for pageLayoutWidget and keep isActive', () => {
      const after = {
        id: 'plw-1',
        workspaceId: 'ws-1',
        applicationId: 'app-1',
        universalIdentifier: 'uid-1',
        title: 'Original',
        type: 'FIELDS',
        position: '{}',
        gridPosition: '{}',
        configuration: '{}',
        conditionalDisplay: null,
        pageLayoutTabId: 'plt-1',
        isActive: true,
        overrides: { title: 'Overridden Title' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        deletedAt: null,
      };

      const batch = makeBatch('pageLayoutWidget', [
        {
          type: 'created',
          metadataName: 'pageLayoutWidget',
          recordId: 'plw-1',
          properties: { after },
        },
      ]);

      const result = resolveOverridableEntityEventBatchOverrides(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.title).toBe('Overridden Title');
      expect(createdRecord).not.toHaveProperty('overrides');
      expect(createdRecord).toHaveProperty('isActive', true);
    });
  });
});
