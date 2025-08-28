import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { mockObjectMetadataItemsWithFieldMaps } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields',
);

describe('generateFakeObjectRecordEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockFields = {
    field1: {
      type: 'TEXT',
      value: 'test',
      fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
    },
    field2: {
      type: 'NUMBER',
      value: 123,
      fieldMetadataId: '123e4567-e89b-12d3-a456-426614174001',
    },
  };

  const companyMockObjectMetadataItem =
    mockObjectMetadataItemsWithFieldMaps.find(
      (item) => item.nameSingular === 'company',
    )!;

  const mockObjectMetadataMaps = {
    byId: {
      [companyMockObjectMetadataItem.id]: companyMockObjectMetadataItem,
    },
    idByNameSingular: {
      [companyMockObjectMetadataItem.nameSingular]:
        companyMockObjectMetadataItem.id,
    },
  };

  const objectMetadataInfo = {
    objectMetadataMaps: mockObjectMetadataMaps,
    objectMetadataItemWithFieldsMaps: companyMockObjectMetadataItem,
  };

  beforeEach(() => {
    (generateObjectRecordFields as jest.Mock).mockReturnValue(mockFields);
  });

  it('should generate record with "after" prefix for CREATED action', () => {
    const result = generateFakeObjectRecordEvent(
      objectMetadataInfo,
      DatabaseEventAction.CREATED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-company-icon',
        label: 'Company',
        value: 'A company',
        nameSingular: 'company',
        fieldIdName: 'properties.after.id',
        objectMetadataId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
      },
      fields: {
        'properties.after.field1': {
          type: 'TEXT',
          value: 'test',
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
        },
        'properties.after.field2': {
          type: 'NUMBER',
          value: 123,
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174001',
        },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate record with "after" prefix for UPDATED action', () => {
    const result = generateFakeObjectRecordEvent(
      objectMetadataInfo,
      DatabaseEventAction.UPDATED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-company-icon',
        label: 'Company',
        value: 'A company',
        nameSingular: 'company',
        fieldIdName: 'properties.after.id',
        objectMetadataId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
      },
      fields: {
        'properties.after.field1': {
          type: 'TEXT',
          value: 'test',
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
        },
        'properties.after.field2': {
          type: 'NUMBER',
          value: 123,
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174001',
        },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate record with "before" prefix for DELETED action', () => {
    const result = generateFakeObjectRecordEvent(
      objectMetadataInfo,
      DatabaseEventAction.DELETED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-company-icon',
        label: 'Company',
        value: 'A company',
        nameSingular: 'company',
        fieldIdName: 'properties.before.id',
        objectMetadataId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
      },
      fields: {
        'properties.before.field1': {
          type: 'TEXT',
          value: 'test',
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
        },
        'properties.before.field2': {
          type: 'NUMBER',
          value: 123,
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174001',
        },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate record with "before" prefix for DESTROYED action', () => {
    const result = generateFakeObjectRecordEvent(
      objectMetadataInfo,
      DatabaseEventAction.DESTROYED,
    );

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-company-icon',
        label: 'Company',
        value: 'A company',
        nameSingular: 'company',
        fieldIdName: 'properties.before.id',
        objectMetadataId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
      },
      fields: {
        'properties.before.field1': {
          type: 'TEXT',
          value: 'test',
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
        },
        'properties.before.field2': {
          type: 'NUMBER',
          value: 123,
          fieldMetadataId: '123e4567-e89b-12d3-a456-426614174001',
        },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should throw error for unknown action', () => {
    expect(() => {
      generateFakeObjectRecordEvent(
        objectMetadataInfo,
        'UNKNOWN' as DatabaseEventAction,
      );
    }).toThrow("Unknown action 'UNKNOWN'");
  });
});
