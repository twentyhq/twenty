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
});
