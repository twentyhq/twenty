import { type RecordGqlFields } from '../../../types/RecordGqlFields';
import { computeRelationWithArgumentsResponseKey } from '../computeRelationWithArgumentsResponseKey';

const ID_SELECTION: RecordGqlFields = { id: true };
const JOB_TITLE_SELECTION: RecordGqlFields = { id: true, jobTitle: true };

describe('computeRelationWithArgumentsResponseKey', () => {
  it('builds a valid GraphQL name prefixed by the relation field', () => {
    expect(
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        filter: { city: { eq: 'Paris' } },
        recordGqlFields: ID_SELECTION,
      }),
    ).toMatch(/^people_[0-9a-f]{16}$/);
  });

  it('ignores key order and undefined arguments', () => {
    expect(
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        filter: { city: { eq: 'Paris' }, jobTitle: { eq: 'Designer' } },
        first: 2,
        recordGqlFields: { id: true, name: true },
      }),
    ).toBe(
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        recordGqlFields: { name: true, id: true },
        first: 2,
        orderBy: undefined,
        filter: { jobTitle: { eq: 'Designer' }, city: { eq: 'Paris' } },
      }),
    );
  });

  it('changes with the arguments and the selected fields', () => {
    const responseKeys = [
      { filter: { city: { eq: 'Paris' } } },
      { filter: { city: { eq: 'London' } } },
      { filter: { city: { eq: 'Paris' } }, first: 1 },
      {
        filter: { city: { eq: 'Paris' } },
        orderBy: [{ jobTitle: 'AscNullsLast' as const }],
      },
      {
        filter: { city: { eq: 'Paris' } },
        recordGqlFields: JOB_TITLE_SELECTION,
      },
    ].map((relationArguments) =>
      computeRelationWithArgumentsResponseKey({
        relationFieldName: 'people',
        recordGqlFields: ID_SELECTION,
        ...relationArguments,
      }),
    );

    expect(new Set(responseKeys).size).toBe(responseKeys.length);
  });
});
