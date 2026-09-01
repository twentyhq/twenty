import { extractNestedRelationFieldsByEntityIndex } from 'src/engine/twenty-orm/utils/extract-nested-relation-fields-by-entity-index.util';

describe('extractNestedRelationFieldsByEntityIndex', () => {
  it('extracts nested create fields by record index', () => {
    expect(
      extractNestedRelationFieldsByEntityIndex([
        {
          name: 'Pivot',
          targetPerson: { create: { id: 'target-id', name: 'Target' } },
        },
      ]).relationCreateQueryFieldsByEntityIndex,
    ).toEqual({
      0: {
        targetPerson: { create: { id: 'target-id', name: 'Target' } },
      },
    });
  });

  it('rejects multiple operations on the same relation field', () => {
    expect(() =>
      extractNestedRelationFieldsByEntityIndex([
        {
          targetPerson: {
            create: { id: 'target-id' },
            connect: { where: { id: 'existing-id' } },
          },
        },
      ]),
    ).toThrow('Cannot combine create, connect, and disconnect');
  });
});
