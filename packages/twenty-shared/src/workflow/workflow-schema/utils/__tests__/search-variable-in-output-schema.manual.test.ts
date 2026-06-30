import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type RecordOutputSchemaV2 } from '../../types/output-schema.type';
import { searchVariableInOutputSchema } from '../search-variable-in-output-schema';

const searchManualTrigger = ({
  schema,
  rawVariableName,
  isFullRecord = false,
}: {
  schema: unknown;
  rawVariableName: string;
  isFullRecord?: boolean;
}) =>
  searchVariableInOutputSchema({
    schema,
    stepType: 'MANUAL',
    stepName: 'Trigger',
    rawVariableName,
    isFullRecord,
  });

const companyRecordSchema: RecordOutputSchemaV2 = {
  object: {
    objectMetadataId: 'company-metadata-id',
    label: 'Company',
  },
  fields: {
    id: {
      isLeaf: true,
      type: FieldMetadataType.UUID,
      label: 'Id',
      value: 'id-value',
      fieldMetadataId: 'company-id-metadata-id',
      isCompositeSubField: false,
    },
    name: {
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Name',
      value: 'Acme',
      fieldMetadataId: 'company-name-metadata-id',
      isCompositeSubField: false,
    },
  },
  _outputSchemaType: 'RECORD',
};

const metadataNode = {
  isLeaf: false as const,
  label: 'Metadata',
  type: 'object' as const,
  value: {
    workspaceMemberId: {
      isLeaf: true as const,
      type: 'string' as const,
      label: 'Workspace Member',
      value: 'member-id',
    },
  },
};

describe('searchVariableInOutputSchema - manual trigger output schema', () => {
  const singleRecordSchema = {
    payload: {
      isLeaf: false as const,
      label: 'Record',
      value: companyRecordSchema,
    },
    metadata: metadataNode,
  };

  const bulkRecordsSchema = {
    payload: {
      isLeaf: false as const,
      type: 'object' as const,
      label: 'Record',
      value: {
        companies: {
          isLeaf: true as const,
          type: 'array' as const,
          label: 'Companies',
          value: 'Array of Companies',
        },
      },
    },
    metadata: metadataNode,
  };

  const globalSchema = { metadata: metadataNode };

  it('resolves a single-record payload field', () => {
    expect(
      searchManualTrigger({
        schema: singleRecordSchema,
        rawVariableName: '{{trigger.payload.name}}',
      }),
    ).toEqual({
      variableLabel: 'Name',
      variablePathLabel: 'Trigger > Record > Name',
      variableType: FieldMetadataType.TEXT,
      fieldMetadataId: 'company-name-metadata-id',
      compositeFieldSubFieldName: undefined,
    });
  });

  it('resolves the full record via payload id when isFullRecord', () => {
    expect(
      searchManualTrigger({
        schema: singleRecordSchema,
        rawVariableName: '{{trigger.payload.id}}',
        isFullRecord: true,
      }),
    ).toEqual(
      expect.objectContaining({
        variableLabel: 'Company',
        variablePathLabel: 'Trigger > Record > Company',
      }),
    );
  });

  it('resolves a bulk-records payload array', () => {
    expect(
      searchManualTrigger({
        schema: bulkRecordsSchema,
        rawVariableName: '{{trigger.payload.companies}}',
      }),
    ).toEqual({
      variableLabel: 'Companies',
      variablePathLabel: 'Trigger > Record > Companies',
      variableType: 'array',
    });
  });

  it('resolves a metadata field for any availability', () => {
    expect(
      searchManualTrigger({
        schema: globalSchema,
        rawVariableName: '{{trigger.metadata.workspaceMemberId}}',
      }),
    ).toEqual({
      variableLabel: 'Workspace Member',
      variablePathLabel: 'Trigger > Metadata > Workspace Member',
      variableType: 'string',
    });
  });

  it('returns Not Found for an unknown payload field', () => {
    expect(
      searchManualTrigger({
        schema: singleRecordSchema,
        rawVariableName: '{{trigger.payload.unknownField}}',
      }),
    ).toEqual({ variableLabel: undefined, variablePathLabel: undefined });
  });

  it('returns Not Found for an unknown top-level node', () => {
    expect(
      searchManualTrigger({
        schema: singleRecordSchema,
        rawVariableName: '{{trigger.notANode.x}}',
      }),
    ).toEqual({ variableLabel: undefined, variablePathLabel: undefined });
  });

  it('returns Not Found for a bare node reference without a field', () => {
    expect(
      searchManualTrigger({
        schema: singleRecordSchema,
        rawVariableName: '{{trigger.payload}}',
      }),
    ).toEqual({ variableLabel: undefined, variablePathLabel: undefined });
  });
});
