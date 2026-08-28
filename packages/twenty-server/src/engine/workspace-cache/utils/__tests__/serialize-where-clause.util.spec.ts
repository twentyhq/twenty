import { Equal, ILike, In, IsNull, Not, Raw } from 'typeorm';

import { serializeWhereClause } from 'src/engine/workspace-cache/utils/serialize-where-clause.util';

describe('serializeWhereClause', () => {
  it('serializes structurally equal clauses to the same key whatever the instances and key order', () => {
    expect(
      serializeWhereClause({ agentId: Not(IsNull()), isVisible: true }),
    ).toBe(serializeWhereClause({ isVisible: true, agentId: Not(IsNull()) }));
  });

  it('distinguishes different operators on the same column', () => {
    expect(serializeWhereClause({ agentId: Not(IsNull()) })).not.toBe(
      serializeWhereClause({ agentId: IsNull() }),
    );
    expect(serializeWhereClause({ name: Equal('a') })).not.toBe(
      serializeWhereClause({ name: ILike('a') }),
    );
  });

  it('distinguishes plain values from their string representations', () => {
    expect(serializeWhereClause({ position: 1 })).not.toBe(
      serializeWhereClause({ position: '1' }),
    );
    expect(serializeWhereClause({ isVisible: true })).not.toBe(
      serializeWhereClause({ isVisible: 'true' }),
    );
  });

  it('serializes operator values, keeping array order significant', () => {
    expect(serializeWhereClause({ id: In(['a', 'b']) })).toBe(
      serializeWhereClause({ id: In(['a', 'b']) }),
    );
    expect(serializeWhereClause({ id: In(['a', 'b']) })).not.toBe(
      serializeWhereClause({ id: In(['b', 'a']) }),
    );
  });

  it('serializes nested relation clauses with sorted keys', () => {
    expect(
      serializeWhereClause({
        view: { objectMetadataId: 'x', deletedAt: IsNull() },
      }),
    ).toBe(
      serializeWhereClause({
        view: { deletedAt: IsNull(), objectMetadataId: 'x' },
      }),
    );
  });

  it('serializes dates by their ISO timestamp', () => {
    const timestamp = '2026-01-01T00:00:00.000Z';

    expect(serializeWhereClause({ createdAt: new Date(timestamp) })).toBe(
      serializeWhereClause({ createdAt: new Date(timestamp) }),
    );
    expect(serializeWhereClause({ createdAt: new Date(timestamp) })).toContain(
      timestamp,
    );
  });

  it('distinguishes null from undefined values', () => {
    expect(serializeWhereClause({ deletedAt: null })).not.toBe(
      serializeWhereClause({ deletedAt: undefined }),
    );
  });

  it('serializes clauses into readable fetch key fragments', () => {
    expect(
      serializeWhereClause({ agentId: Not(IsNull()) }),
    ).toMatchInlineSnapshot(`"{agentId:op(not:op(isNull:undefined))}"`);
    expect(
      serializeWhereClause({ position: 1, name: 'a', isVisible: true }),
    ).toMatchInlineSnapshot(`"{isVisible:true,name:"a",position:1}"`);
    expect(serializeWhereClause({ id: In(['a', 'b']) })).toMatchInlineSnapshot(
      `"{id:op(in:["a","b"])}"`,
    );
    expect(
      serializeWhereClause({ createdAt: new Date('2026-01-01T00:00:00.000Z') }),
    ).toMatchInlineSnapshot(`"{createdAt:date(2026-01-01T00:00:00.000Z)}"`);
    expect(
      serializeWhereClause({
        view: { deletedAt: IsNull(), objectMetadataId: 'x' },
      }),
    ).toMatchInlineSnapshot(
      `"{view:{deletedAt:op(isNull:undefined),objectMetadataId:"x"}}"`,
    );
  });

  it('throws on function-bearing predicates', () => {
    expect(() =>
      serializeWhereClause({ id: Raw((alias) => `${alias} > 0`) }),
    ).toThrow(/Raw\(\) and computed predicates are not supported/);
  });
});
