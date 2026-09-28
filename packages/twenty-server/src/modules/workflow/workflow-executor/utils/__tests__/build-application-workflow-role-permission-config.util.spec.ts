import { buildApplicationWorkflowRolePermissionConfig } from 'src/modules/workflow/workflow-executor/utils/build-application-workflow-role-permission-config.util';

describe('buildApplicationWorkflowRolePermissionConfig', () => {
  it('uses the application role alone when no member started the run', () => {
    expect(
      buildApplicationWorkflowRolePermissionConfig({
        owningApplication: { name: 'App', defaultRoleId: 'app-role-id' },
      }),
    ).toEqual({ intersectionOf: ['app-role-id'] });
  });

  it('never grants more than both the member and the application may do', () => {
    expect(
      buildApplicationWorkflowRolePermissionConfig({
        owningApplication: { name: 'App', defaultRoleId: 'app-role-id' },
        userRoleId: 'admin-role-id',
      }),
    ).toEqual({ intersectionOf: ['admin-role-id', 'app-role-id'] });
  });

  it('fails closed when the application has no role', () => {
    expect(() =>
      buildApplicationWorkflowRolePermissionConfig({
        owningApplication: { name: 'App', defaultRoleId: null },
        userRoleId: 'admin-role-id',
      }),
    ).toThrow('Application "App" has no role');
  });
});
