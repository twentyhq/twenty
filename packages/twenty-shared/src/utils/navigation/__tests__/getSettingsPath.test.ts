import { SettingsPath } from '../../../types';
import { getSettingsPath } from '../getSettingsPath';

describe('getSettingsPath', () => {
  it('should return settings path with correct prefix when no params or query params provided', () => {
    expect(getSettingsPath(SettingsPath.ProfilePage)).toBe('/settings/profile');
    expect(getSettingsPath(SettingsPath.Workspace)).toBe('/settings/general');
    expect(getSettingsPath(SettingsPath.Accounts)).toBe('/settings/accounts');
  });

  it('should generate path with params using react-router generatePath', () => {
    expect(
      getSettingsPath(SettingsPath.ObjectDetail, {
        objectNamePlural: 'companies',
      }),
    ).toBe('/settings/objects/companies');

    expect(
      getSettingsPath(SettingsPath.ObjectFieldEdit, {
        objectNamePlural: 'companies',
        fieldName: 'name',
      }),
    ).toBe('/settings/objects/companies/name');

    expect(
      getSettingsPath(SettingsPath.ServerlessFunctionDetail, {
        serverlessFunctionId: 'func123',
      }),
    ).toBe('/settings/functions/func123');

    expect(
      getSettingsPath(SettingsPath.EditImapSmtpCaldavConnection, {
        connectedAccountId: 'account123',
      }),
    ).toBe('/settings/accounts/edit-imap-smtp-caldav-connection/account123');
  });

  it('should append query params when provided', () => {
    expect(
      getSettingsPath(SettingsPath.ProfilePage, undefined, {
        tab: 'personal',
        edit: 'true',
      }),
    ).toBe('/settings/profile?tab=personal&edit=true');

    expect(
      getSettingsPath(SettingsPath.Objects, undefined, {
        view: 'list',
      }),
    ).toBe('/settings/objects?view=list');
  });

  it('should append hash when provided', () => {
    expect(
      getSettingsPath(
        SettingsPath.ProfilePage,
        undefined,
        undefined,
        'section1',
      ),
    ).toBe('/settings/profile#section1');

    expect(
      getSettingsPath(SettingsPath.Workspace, undefined, undefined, 'general'),
    ).toBe('/settings/general#general');
  });

  it('should handle hash with leading # character', () => {
    expect(
      getSettingsPath(
        SettingsPath.ProfilePage,
        undefined,
        undefined,
        '#section1',
      ),
    ).toBe('/settings/profile#section1');
  });

  it('should handle params, query params, and hash together', () => {
    expect(
      getSettingsPath(
        SettingsPath.ObjectDetail,
        { objectNamePlural: 'companies' },
        { tab: 'fields', edit: 'true' },
        'advanced',
      ),
    ).toBe('/settings/objects/companies?tab=fields&edit=true#advanced');

    expect(
      getSettingsPath(
        SettingsPath.ServerlessFunctionDetail,
        { serverlessFunctionId: 'func123' },
        { mode: 'edit' },
        'code',
      ),
    ).toBe('/settings/functions/func123?mode=edit#code');
  });

  it('should filter out null and undefined values from query params', () => {
    expect(
      getSettingsPath(SettingsPath.ProfilePage, undefined, {
        tab: 'personal',
        edit: null,
        view: undefined,
        active: 'true',
      }),
    ).toBe('/settings/profile?tab=personal&active=true');
  });

  it('should handle empty query params object', () => {
    expect(getSettingsPath(SettingsPath.ProfilePage, undefined, {})).toBe(
      '/settings/profile',
    );
  });

  it('should handle query params with only null/undefined values', () => {
    expect(
      getSettingsPath(SettingsPath.ProfilePage, undefined, {
        tab: null,
        edit: undefined,
      }),
    ).toBe('/settings/profile');
  });

  it('should handle complex query param values', () => {
    expect(
      getSettingsPath(SettingsPath.Objects, undefined, {
        filters: JSON.stringify({ type: 'custom' }),
        sort: ['name', 'created'],
        page: 1,
        enabled: true,
      }),
    ).toBe(
      '/settings/objects?filters=%7B%22type%22%3A%22custom%22%7D&sort%5B0%5D=name&sort%5B1%5D=created&page=1&enabled=true',
    );
  });

  it('should handle special characters in query params', () => {
    expect(
      getSettingsPath(SettingsPath.ProfilePage, undefined, {
        search: 'test & query',
        email: 'user@example.com',
      }),
    ).toBe(
      '/settings/profile?search=test%20%26%20query&email=user%40example.com',
    );
  });
});
