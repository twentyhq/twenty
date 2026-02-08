import { camelToSnakeCase } from '../camelToSnakeCase';

describe('camelToSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(camelToSnakeCase('cloudUserWorkspaces')).toBe(
      'cloud_user_workspaces',
    );
  });

  it('should convert single-word camelCase', () => {
    expect(camelToSnakeCase('people')).toBe('people');
  });

  it('should handle two-word camelCase', () => {
    expect(camelToSnakeCase('selfHostingUser')).toBe('self_hosting_user');
  });

  it('should handle already snake_case', () => {
    expect(camelToSnakeCase('already_snake')).toBe('already_snake');
  });

  it('should handle single word', () => {
    expect(camelToSnakeCase('company')).toBe('company');
  });
});
