import { createRowToEntityMapper } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';

describe('createRowToEntityMapper', () => {
  it('maps selected flat columns and preserves null and undefined values', () => {
    const mapRow = createRowToEntityMapper({
      person_id: 'id',
      person_name: 'name',
      person_deletedAt: 'deletedAt',
      person_missing: 'missing',
    });

    expect(
      mapRow({
        person_id: 'first',
        person_name: undefined,
        person_deletedAt: null,
        extra: 'ignored',
      }),
    ).toEqual({
      id: 'first',
      name: undefined,
      deletedAt: null,
    });
    expect(mapRow({ person_id: 'second', person_name: 'Name' })).toEqual({
      id: 'second',
      name: 'Name',
    });
  });

  it('reuses the mapping without sharing nested values across rows', () => {
    const mapRow = createRowToEntityMapper({
      person_id: 'id',
      company_id: 'company.id',
      company_name: 'company.name',
      owner_id: 'company.owner.id',
      owner_name: 'company.owner.name',
    });
    const first = mapRow({
      person_id: 'first',
      company_id: 'company-1',
      company_name: 'First',
      owner_id: 'owner-1',
      owner_name: 'Alice',
    });
    const second = mapRow({
      person_id: 'second',
      company_id: 'company-2',
      company_name: 'Second',
      owner_id: null,
      owner_name: null,
    });
    const unmatched = mapRow({
      person_id: 'third',
      company_id: null,
      company_name: null,
      owner_id: null,
      owner_name: null,
    });

    expect(first).toEqual({
      id: 'first',
      company: {
        id: 'company-1',
        name: 'First',
        owner: { id: 'owner-1', name: 'Alice' },
      },
    });
    expect(second).toEqual({
      id: 'second',
      company: { id: 'company-2', name: 'Second', owner: null },
    });
    expect(unmatched).toEqual({ id: 'third', company: null });
  });

  it('keeps a partial joined object without an ID, even when its value is null', () => {
    const mapRow = createRowToEntityMapper({ company_name: 'company.name' });

    expect(mapRow({ company_name: null })).toEqual({ company: { name: null } });
    expect(mapRow({})).toEqual({});
  });
});
