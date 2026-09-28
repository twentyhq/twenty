import { buildApplicationWorkflowRolePermissionConfig } from 'src/modules/workflow/workflow-executor/utils/build-application-workflow-role-permission-config.util';

const APPLICATION = { name: 'App', defaultRoleId: 'app-role-id' };

describe('buildApplicationWorkflowRolePermissionConfig', () => {
  it('uses the application role alone when no member started the run', () => {
    expect(
      buildApplicationWorkflowRolePermissionConfig({
        applications: [APPLICATION],
      }),
    ).toEqual({ intersectionOf: ['app-role-id'] });
  });

  it('never grants more than both the member and the application may do', () => {
    expect(
      buildApplicationWorkflowRolePermissionConfig({
        applications: [APPLICATION],
        userRoleId: 'admin-role-id',
      }),
    ).toEqual({ intersectionOf: ['admin-role-id', 'app-role-id'] });
  });

  it('keeps the bound of every application the run crosses', () => {
    expect(
      buildApplicationWorkflowRolePermissionConfig({
        applications: [
          APPLICATION,
          { name: 'Starting app', defaultRoleId: 'starting-app-role-id' },
        ],
        userRoleId: 'admin-role-id',
      }),
    ).toEqual({
      intersectionOf: ['admin-role-id', 'app-role-id', 'starting-app-role-id'],
    });
  });

  it('fails closed when an application has no role', () => {
    expect(() =>
      buildApplicationWorkflowRolePermissionConfig({
        applications: [{ name: 'App', defaultRoleId: null }],
        userRoleId: 'admin-role-id',
      }),
    ).toThrow('Application "App" has no role');
  });
});
