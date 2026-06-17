import { getOutputSchemaMismatchIssues } from '@/logic-function/get-output-schema-mismatch-issues';
import {
  type BaseOutputSchemaV2,
  type Leaf,
  type LeafType,
  type Node,
} from '@/workflow/workflow-schema/types/base-output-schema.type';

const leaf = (type: LeafType, label = 'label'): Leaf => ({
  isLeaf: true,
  type,
  label,
  value: null,
});

const node = (value: BaseOutputSchemaV2, label = 'label'): Node => ({
  isLeaf: false,
  type: 'object',
  label,
  value,
});

describe('getOutputSchemaMismatchIssues', () => {
  it('should return no issues when declared schema matches the expected one', () => {
    const declared: BaseOutputSchemaV2 = {
      name: leaf('string'),
      age: leaf('number'),
    };
    const expected: BaseOutputSchemaV2 = {
      name: leaf('string'),
      age: leaf('number'),
    };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([]);
  });

  it('should ignore keys present only in the declared schema', () => {
    const declared: BaseOutputSchemaV2 = {
      name: leaf('string'),
      extra: leaf('string'),
    };
    const expected: BaseOutputSchemaV2 = {
      name: leaf('string'),
    };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([]);
  });

  it('should report keys missing from the declared schema', () => {
    const declared: BaseOutputSchemaV2 = {
      name: leaf('string'),
    };
    const expected: BaseOutputSchemaV2 = {
      name: leaf('string'),
      age: leaf('number'),
    };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([
      'Missing key "age" in declared output schema.',
    ]);
  });

  it('should report leaf type mismatches', () => {
    const declared: BaseOutputSchemaV2 = { age: leaf('string') };
    const expected: BaseOutputSchemaV2 = { age: leaf('number') };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([
      'Type mismatch at "age": expected number but declared string.',
    ]);
  });

  it('should report leaf vs object mismatches', () => {
    const declared: BaseOutputSchemaV2 = { user: leaf('string') };
    const expected: BaseOutputSchemaV2 = {
      user: node({ name: leaf('string') }),
    };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([
      'Type mismatch at "user": expected object but declared string.',
    ]);
  });

  it('should recurse into nested objects with dotted paths', () => {
    const declared: BaseOutputSchemaV2 = {
      user: node({ name: leaf('string'), age: leaf('string') }),
    };
    const expected: BaseOutputSchemaV2 = {
      user: node({ name: leaf('string'), age: leaf('number') }),
    };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([
      'Type mismatch at "user.age": expected number but declared string.',
    ]);
  });

  it('should not flag mismatches when the expected leaf type is unknown', () => {
    const declared: BaseOutputSchemaV2 = { maybe: leaf('string') };
    const expected: BaseOutputSchemaV2 = { maybe: leaf('unknown') };

    expect(getOutputSchemaMismatchIssues(declared, expected)).toEqual([]);
  });

  it('should return no issues for an empty expected schema', () => {
    expect(getOutputSchemaMismatchIssues({ a: leaf('string') }, {})).toEqual([]);
  });
});
