import { isFieldMetadataComputation } from 'src/engine/metadata-modules/computed-field/utils/is-field-metadata-computation.util';

describe('isFieldMetadataComputation', () => {
  it.each([
    { kind: 'FORMULA', expression: 'budget * 2' },
    { kind: 'FORMULA', expression: '', bindings: {} },
    { kind: 'ROLLUP', relationFieldName: 'tasks', operation: 'COUNT' },
    {
      kind: 'ROLLUP',
      relationFieldName: 'tasks',
      operation: 'SUM',
      expression: 'points',
      filter: 'isDone',
    },
    { kind: 'FILTERED_RELATION', relationFieldName: 'tasks' },
    {
      kind: 'FILTERED_RELATION',
      relationFieldName: 'tasks',
      filter: 'isDone',
      orderBy: [{ expression: 'points * 2', direction: 'DescNullsLast' }],
      limit: 3,
    },
  ])('accepts %j', (computation) => {
    expect(isFieldMetadataComputation(computation)).toBe(true);
  });

  it.each([
    null,
    'budget * 2',
    { expression: 'budget * 2' },
    { kind: 'toString', expression: 'budget * 2' },
    { kind: 'FORMULA' },
    { kind: 'FORMULA', expression: 123 },
    { kind: 'ROLLUP', operation: 'COUNT' },
    { kind: 'ROLLUP', relationFieldName: '', operation: 'COUNT' },
    { kind: 'ROLLUP', relationFieldName: 'tasks', operation: 'MEDIAN' },
    {
      kind: 'ROLLUP',
      relationFieldName: 'tasks',
      operation: 'COUNT',
      filter: 1,
    },
    { kind: 'FILTERED_RELATION' },
    {
      kind: 'FILTERED_RELATION',
      relationFieldName: 'tasks',
      orderBy: 'points',
    },
    {
      kind: 'FILTERED_RELATION',
      relationFieldName: 'tasks',
      orderBy: [{ points: 'DescNullsLast' }],
    },
  ])('refuses %j', (computation) => {
    expect(isFieldMetadataComputation(computation)).toBe(false);
  });
});
