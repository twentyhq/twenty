import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields',
);

describe('generateFakeObjectRecordEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockObjectMetadata = {
    icon: 'test-icon',
    labelSingular: 'Test Object',
    description: 'Test Description',
    nameSingular: 'testObject',
  } as ObjectMetadataEntity;

  const mockFields = {
    field1: { type: 'TEXT', value: 'test' },
    field2: { type: 'NUMBER', value: 123 },
  };

  beforeEach(() => {
    (generateObjectRecordFields as jest.Mock).mockReturnValue(mockFields);
  });

  it('should generate record with "after" prefix for CREATED action', () => {
    const result = generateFakeObjectRecordEvent(
      mockObjectMetadata,
      DatabaseEventAction.CREATED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-icon',
        label: 'Test Object',
        value: 'Test Description',
        nameSingular: 'testObject',
        fieldIdName: 'properties.after.id',
      },
      fields: {
        'properties.after.field1': { type: 'TEXT', value: 'test' },
        'properties.after.field2': { type: 'NUMBER', value: 123 },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate record with "after" prefix for UPDATED action', () => {
    const result = generateFakeObjectRecordEvent(
      mockObjectMetadata,
      DatabaseEventAction.UPDATED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-icon',
        label: 'Test Object',
        value: 'Test Description',
        nameSingular: 'testObject',
        fieldIdName: 'properties.after.id',
      },
      fields: {
        'properties.after.field1': { type: 'TEXT', value: 'test' },
        'properties.after.field2': { type: 'NUMBER', value: 123 },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate record with "before" prefix for DELETED action', () => {
    const result = generateFakeObjectRecordEvent(
      mockObjectMetadata,
      DatabaseEventAction.DELETED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-icon',
        label: 'Test Object',
        value: 'Test Description',
        nameSingular: 'testObject',
        fieldIdName: 'properties.before.id',
      },
      fields: {
        'properties.before.field1': { type: 'TEXT', value: 'test' },
        'properties.before.field2': { type: 'NUMBER', value: 123 },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate record with "before" prefix for DESTROYED action', () => {
    const result = generateFakeObjectRecordEvent(
      mockObjectMetadata,
      DatabaseEventAction.DESTROYED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-icon',
        label: 'Test Object',
        value: 'Test Description',
        nameSingular: 'testObject',
        fieldIdName: 'properties.before.id',
      },
      fields: {
        'properties.before.field1': { type: 'TEXT', value: 'test' },
        'properties.before.field2': { type: 'NUMBER', value: 123 },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should throw error for unknown action', () => {
    expect(() => {
      generateFakeObjectRecordEvent(
        mockObjectMetadata,
        'UNKNOWN' as DatabaseEventAction,
      );
    }).toThrow("Unknown action 'UNKNOWN'");
  });
});
