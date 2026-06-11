import { resolveVariablePathInOutputSchema } from '../resolveVariablePathInOutputSchema';

const databaseEventTriggerSchema = {
  object: {
    label: 'Task',
    objectMetadataId: 'object-1',
    fieldIdName: 'properties.after.id',
  },
  fields: {
    'properties.after.status': {
      isLeaf: true,
      type: 'SELECT',
      label: 'Status',
      value: 'My text',
      fieldMetadataId: 'field-status',
    },
    'properties.after.name': {
      isLeaf: false,
      type: 'FULL_NAME',
      label: 'Name',
      fieldMetadataId: 'field-name',
      value: {
        firstName: {
          isLeaf: true,
          type: 'TEXT',
          label: 'First Name',
          value: 'Tim',
          fieldMetadataId: 'field-name',
          isCompositeSubField: true,
        },
      },
    },
  },
  _outputSchemaType: 'RECORD',
};

describe('resolveVariablePathInOutputSchema', () => {
  describe('database event record schema', () => {
    it('should resolve a dotted event-prefixed field path', () => {
      const result = resolveVariablePathInOutputSchema({
        schema: databaseEventTriggerSchema,
        propertyPath: ['properties', 'after', 'status'],
      });

      expect(result.found).toBe(true);
      expect(result.type).toBe('SELECT');
      expect(result.label).toBe('Status');
    });

    it('should resolve a composite sub-field under an event prefix', () => {
      const result = resolveVariablePathInOutputSchema({
        schema: databaseEventTriggerSchema,
        propertyPath: ['properties', 'after', 'name', 'firstName'],
      });

      expect(result.found).toBe(true);
      expect(result.type).toBe('TEXT');
    });

    it('should not resolve an "object.*" path that does not match the real keys', () => {
      const result = resolveVariablePathInOutputSchema({
        schema: databaseEventTriggerSchema,
        propertyPath: ['object', 'status'],
      });

      expect(result.found).toBe(false);
    });

    it('should not resolve an unknown field', () => {
      const result = resolveVariablePathInOutputSchema({
        schema: databaseEventTriggerSchema,
        propertyPath: ['properties', 'after', 'statuss'],
      });

      expect(result.found).toBe(false);
    });
  });

  describe('base output schema', () => {
    const baseSchema = {
      success: { isLeaf: true, type: 'boolean', label: 'Success', value: true },
    };

    it('should resolve a top-level leaf', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: baseSchema,
          propertyPath: ['success'],
        }).found,
      ).toBe(true);
    });

    it('should not resolve a missing leaf', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: baseSchema,
          propertyPath: ['failure'],
        }).found,
      ).toBe(false);
    });
  });

  describe('find records schema', () => {
    const findRecordsSchema = {
      first: {
        isLeaf: false,
        label: 'First Task',
        value: {
          object: {
            label: 'Task',
            objectMetadataId: 'object-1',
            fieldIdName: 'id',
          },
          fields: {
            title: {
              isLeaf: true,
              type: 'TEXT',
              label: 'Title',
              value: 'My text',
              fieldMetadataId: 'field-title',
            },
          },
          _outputSchemaType: 'RECORD',
        },
      },
      all: {
        isLeaf: true,
        type: 'array',
        label: 'All Records',
        value: 'Returns an array of records',
      },
      totalCount: {
        isLeaf: true,
        type: 'number',
        label: 'Total Count',
        value: 'Count of matching records',
      },
    };

    it('should resolve a field under "first"', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: findRecordsSchema,
          propertyPath: ['first', 'title'],
        }).found,
      ).toBe(true);
    });

    it('should resolve the terminal "first" node', () => {
      const result = resolveVariablePathInOutputSchema({
        schema: findRecordsSchema,
        propertyPath: ['first'],
      });

      expect(result.found).toBe(true);
      expect(result.label).toBe('First Task');
    });

    it('should resolve totalCount', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: findRecordsSchema,
          propertyPath: ['totalCount'],
        }).found,
      ).toBe(true);
    });

    it('should not resolve a missing field under "first"', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: findRecordsSchema,
          propertyPath: ['first', 'missing'],
        }).found,
      ).toBe(false);
    });
  });

  describe('code step schema that mimics find records keys', () => {
    // A CODE step can return an arbitrary object whose keys happen to match
    // "first" and "totalCount". Because "first.value" is not a RECORD output
    // schema, it must be treated as a generic map, not a Find Records schema.
    const codeStepSchema = {
      first: { isLeaf: true, type: 'string', label: 'First', value: 'a' },
      totalCount: { isLeaf: true, type: 'number', label: 'Count', value: 1 },
      foo: { isLeaf: true, type: 'string', label: 'Foo', value: 'bar' },
    };

    it('should resolve the terminal "first" leaf', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: codeStepSchema,
          propertyPath: ['first'],
        }).found,
      ).toBe(true);
    });

    it('should resolve other top-level fields not handled by find records logic', () => {
      expect(
        resolveVariablePathInOutputSchema({
          schema: codeStepSchema,
          propertyPath: ['foo'],
        }).found,
      ).toBe(true);
    });
  });
});
