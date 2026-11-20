import { computeRelationWithArgumentsResponseKey } from '../computeRelationWithArgumentsResponseKey';

describe('computeRelationWithArgumentsResponseKey', () => {
  it('builds a valid GraphQL name prefixed by the relation field', () => {
    expect(
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        filter: { city: { eq: 'Paris' } },
      }),
    ).toMatch(/^people_[0-9a-f]{16}$/);
  });

  it('ignores key order and undefined arguments', () => {
    expect(
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        filter: { city: { eq: 'Paris' }, jobTitle: { eq: 'Designer' } },
        first: 2,
      }),
    ).toBe(
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        first: 2,
        orderBy: undefined,
        filter: { jobTitle: { eq: 'Designer' }, city: { eq: 'Paris' } },
      }),
    );
  });

  it('changes with the arguments', () => {
    const responseKeys = [
      { filter: { city: { eq: 'Paris' } } },
      { filter: { city: { eq: 'London' } } },
      { filter: { city: { eq: 'Paris' } }, first: 1 },
      {
        filter: { city: { eq: 'Paris' } },
        orderBy: [{ jobTitle: 'AscNullsLast' as const }],
      },
    ].map((relationArguments) =>
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        ...relationArguments,
      }),
    );

    expect(new Set(responseKeys).size).toBe(responseKeys.length);
  });
});
