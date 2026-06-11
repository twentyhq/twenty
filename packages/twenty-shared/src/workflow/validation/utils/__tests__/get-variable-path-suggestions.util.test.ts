import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/base-output-schema.type';

import { getVariablePathSuggestions } from '../get-variable-path-suggestions.util';

describe('getVariablePathSuggestions', () => {
  const schema: BaseOutputSchemaV2 = {
    user: {
      isLeaf: false,
      type: 'object',
      label: 'user',
      value: {
        name: {
          isLeaf: true,
          type: 'string',
          label: 'name',
          value: 'Test',
        },
        email: {
          isLeaf: true,
          type: 'string',
          label: 'email',
          value: 'test@test.com',
        },
      },
    },
    id: {
      isLeaf: true,
      type: 'string',
      label: 'id',
      value: '1',
    },
  };

  it('should suggest the closest sibling for a nested typo (strategy A)', () => {
    expect(
      getVariablePathSuggestions({
        schema,
        propertyPath: ['user', 'naem'],
        referencedStepId: 'step-1',
      }),
    ).toEqual(['step-1.user.name']);
  });

  it('should suggest a structurally correct path when the prefix is wrong (strategy B)', () => {
    expect(
      getVariablePathSuggestions({
        schema,
        propertyPath: ['name'],
        referencedStepId: 'step-1',
      }),
    ).toContain('step-1.user.name');
  });

  it('should return no suggestions for an unrelated segment', () => {
    expect(
      getVariablePathSuggestions({
        schema,
        propertyPath: ['completelyDifferentThing'],
        referencedStepId: 'step-1',
      }),
    ).toEqual([]);
  });

  it('should return no suggestions when the path resolves', () => {
    expect(
      getVariablePathSuggestions({
        schema,
        propertyPath: ['user', 'name'],
        referencedStepId: 'step-1',
      }),
    ).toEqual([]);
  });

  it('should suggest record field names (not internal keys) for FIND_RECORDS schemas', () => {
    const findRecordsSchema = {
      first: {
        isLeaf: false,
        label: 'First',
        value: {
          object: {
            objectMetadataId: 'company-metadata-id',
            label: 'Company',
          },
          fields: {
            name: {
              isLeaf: true,
              type: 'TEXT',
              label: 'Company Name',
              value: 'Acme Corp',
              fieldMetadataId: 'company-name-metadata-id',
              isCompositeSubField: false,
            },
            revenue: {
              isLeaf: true,
              type: 'NUMBER',
              label: 'Revenue',
              value: 1000000,
              fieldMetadataId: 'company-revenue-metadata-id',
              isCompositeSubField: false,
            },
          },
          _outputSchemaType: 'RECORD',
        },
      },
      all: {
        isLeaf: true,
        label: 'All',
        value: 'Returns an array of records',
        type: 'array',
      },
      totalCount: {
        isLeaf: true,
        label: 'Total Count',
        value: 42,
        type: 'number',
      },
    };

    const suggestions = getVariablePathSuggestions({
      schema: findRecordsSchema,
      propertyPath: ['first', 'naem'],
      referencedStepId: 'step-1',
    });

    expect(suggestions).toContain('step-1.first.name');
    expect(
      suggestions.some(
        (suggestion) =>
          suggestion.includes('object') ||
          suggestion.includes('fields') ||
          suggestion.includes('_outputSchemaType'),
      ),
    ).toBe(false);
  });

  it('should suggest record field names (not internal keys) for FORM schemas', () => {
    const formSchema = {
      companyName: {
        isLeaf: true,
        type: 'TEXT',
        label: 'Company Name',
        value: 'Acme Corp',
      },
      person: {
        isLeaf: false,
        label: 'Person',
        value: {
          object: {
            objectMetadataId: 'person-metadata-id',
            label: 'Person',
          },
          fields: {
            firstName: {
              isLeaf: true,
              type: 'TEXT',
              label: 'First Name',
              value: 'John',
              fieldMetadataId: 'person-firstName-metadata-id',
              isCompositeSubField: false,
            },
          },
          _outputSchemaType: 'RECORD',
        },
      },
    };

    const suggestions = getVariablePathSuggestions({
      schema: formSchema,
      propertyPath: ['person', 'firstNaem'],
      referencedStepId: 'step-1',
    });

    expect(suggestions).toContain('step-1.person.firstName');
    expect(
      suggestions.some(
        (suggestion) =>
          suggestion.includes('object') ||
          suggestion.includes('fields') ||
          suggestion.includes('_outputSchemaType'),
      ),
    ).toBe(false);
  });
});
