import { AppPath } from '../../../types';
import { getAppPath } from '../getAppPath';

describe('getAppPath', () => {
  it('should return path as-is when no params or query params provided', () => {
    expect(getAppPath(AppPath.Index)).toBe('/');
    expect(getAppPath(AppPath.TasksPage)).toBe('/objects/tasks');
    expect(getAppPath(AppPath.SignInUp)).toBe('/welcome');
  });

  it('should generate path with params using react-router generatePath', () => {
    expect(
      getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: 'companies',
      }),
    ).toBe('/objects/companies');

    expect(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: 'company',
        objectRecordId: '123',
      }),
    ).toBe('/object/company/123');

    expect(
      getAppPath(AppPath.Invite, {
        workspaceInviteHash: 'abc123',
      }),
    ).toBe('/invite/abc123');
  });

  it('should append query params when provided', () => {
    expect(
      getAppPath(AppPath.Index, undefined, {
        filter: 'active',
        sort: 'name',
      }),
    ).toBe('/?filter=active&sort=name');

    expect(
      getAppPath(AppPath.TasksPage, undefined, {
        view: 'kanban',
      }),
    ).toBe('/objects/tasks?view=kanban');
  });

  it('should handle both params and query params together', () => {
    expect(
      getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: 'companies' },
        { filter: 'active', view: 'table' },
      ),
    ).toBe('/objects/companies?filter=active&view=table');

    expect(
      getAppPath(
        AppPath.RecordShowPage,
        { objectNameSingular: 'company', objectRecordId: '123' },
        { tab: 'details' },
      ),
    ).toBe('/object/company/123?tab=details');
  });

  it('should filter out null and undefined values from query params', () => {
    expect(
      getAppPath(AppPath.Index, undefined, {
        filter: 'active',
        sort: null,
        view: undefined,
        limit: '10',
      }),
    ).toBe('/?filter=active&limit=10');
  });

  it('should handle empty query params object', () => {
    expect(getAppPath(AppPath.Index, undefined, {})).toBe('/');
  });

  it('should handle query params with only null/undefined values', () => {
    expect(
      getAppPath(AppPath.Index, undefined, {
        filter: null,
        sort: undefined,
      }),
    ).toBe('/');
  });

  it('should handle complex query param values', () => {
    expect(
      getAppPath(AppPath.Index, undefined, {
        filters: JSON.stringify({ status: 'active' }),
        array: ['value1', 'value2'],
        number: 42,
        boolean: true,
      }),
    ).toBe(
      '/?filters=%7B%22status%22%3A%22active%22%7D&array%5B0%5D=value1&array%5B1%5D=value2&number=42&boolean=true',
    );
  });

  it('should handle special characters in query params', () => {
    expect(
      getAppPath(AppPath.Index, undefined, {
        search: 'test & query',
        email: 'user@example.com',
      }),
    ).toBe('/?search=test%20%26%20query&email=user%40example.com');
  });
});
