import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { sanitizeOverridableEntityEventBatch } from 'src/engine/subscriptions/metadata-event/utils/sanitize-overridable-entity-event-batch.util';

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

describe('sanitizeOverridableEntityEventBatch', () => {
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

      const result = sanitizeOverridableEntityEventBatch(batch);

      expect(result).toBe(batch);
    });
  });

  describe('override resolution', () => {
    it('should resolve overrides into base properties and strip overrides/isActive', () => {
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

      const result = sanitizeOverridableEntityEventBatch(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.isVisible).toBe(false);
      expect(createdRecord).not.toHaveProperty('overrides');
      expect(createdRecord).not.toHaveProperty('isActive');
    });

    it('should strip overrides and isActive even when overrides is null', () => {
      const after = makeViewFieldRecord({ overrides: null });

      const batch = makeBatch('viewField', [
        {
          type: 'created',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: { after },
        },
      ]);

      const result = sanitizeOverridableEntityEventBatch(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.isVisible).toBe(true);
      expect(createdRecord).not.toHaveProperty('overrides');
      expect(createdRecord).not.toHaveProperty('isActive');
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

      const result = sanitizeOverridableEntityEventBatch(batch);

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

      const result = sanitizeOverridableEntityEventBatch(batch);

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

      const result = sanitizeOverridableEntityEventBatch(batch);

      const deletedRecord = (
        result.events[0] as { properties: { before: Record<string, unknown> } }
      ).properties.before;

      expect(deletedRecord.isVisible).toBe(false);
      expect(deletedRecord).not.toHaveProperty('overrides');
      expect(deletedRecord).not.toHaveProperty('isActive');
    });
  });

  describe('isActive transitions', () => {
    it('should drop create events when isActive is false', () => {
      const after = makeViewFieldRecord({ isActive: false });

      const batch = makeBatch('viewField', [
        {
          type: 'created',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: { after },
        },
      ]);

      const result = sanitizeOverridableEntityEventBatch(batch);

      expect(result.events).toHaveLength(0);
    });

    it('should convert update to delete when entity is deactivated', () => {
      const before = makeViewFieldRecord({ isActive: true });
      const after = makeViewFieldRecord({ isActive: false });

      const batch = makeBatch('viewField', [
        {
          type: 'updated',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: {
            updatedFields: ['isActive'],
            diff: {},
            before,
            after,
          },
        },
      ]);

      const result = sanitizeOverridableEntityEventBatch(batch);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe('deleted');
      expect(
        (
          result.events[0] as {
            properties: { before: Record<string, unknown> };
          }
        ).properties.before,
      ).not.toHaveProperty('isActive');
    });

    it('should convert update to create when entity is reactivated', () => {
      const before = makeViewFieldRecord({ isActive: false });
      const after = makeViewFieldRecord({
        isActive: true,
        overrides: { isVisible: false },
      });

      const batch = makeBatch('viewField', [
        {
          type: 'updated',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: {
            updatedFields: ['isActive'],
            diff: {},
            before,
            after,
          },
        },
      ]);

      const result = sanitizeOverridableEntityEventBatch(batch);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe('created');

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.isVisible).toBe(false);
      expect(createdRecord).not.toHaveProperty('overrides');
    });

    it('should drop update events when both before and after are inactive', () => {
      const before = makeViewFieldRecord({ isActive: false });
      const after = makeViewFieldRecord({
        isActive: false,
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

      const result = sanitizeOverridableEntityEventBatch(batch);

      expect(result.events).toHaveLength(0);
    });

    it('should keep update events when both before and after are active', () => {
      const before = makeViewFieldRecord({ isActive: true });
      const after = makeViewFieldRecord({ isActive: true, size: 300 });

      const batch = makeBatch('viewField', [
        {
          type: 'updated',
          metadataName: 'viewField',
          recordId: 'vf-1',
          properties: {
            updatedFields: ['size'],
            diff: {},
            before,
            after,
          },
        },
      ]);

      const result = sanitizeOverridableEntityEventBatch(batch);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe('updated');
    });
  });

  describe('pageLayoutWidget (another overridable entity)', () => {
    it('should resolve overrides for pageLayoutWidget', () => {
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

      const result = sanitizeOverridableEntityEventBatch(batch);

      const createdRecord = (
        result.events[0] as { properties: { after: Record<string, unknown> } }
      ).properties.after;

      expect(createdRecord.title).toBe('Overridden Title');
      expect(createdRecord).not.toHaveProperty('overrides');
      expect(createdRecord).not.toHaveProperty('isActive');
    });
  });
});
