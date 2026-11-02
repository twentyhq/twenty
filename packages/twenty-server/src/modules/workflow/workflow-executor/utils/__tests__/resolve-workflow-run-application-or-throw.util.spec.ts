import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveWorkflowRunApplicationOrThrow } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-application-or-throw.util';

type TestApplication = Pick<
  FlatApplication,
  'id' | 'name' | 'deletedAt' | 'defaultRoleId'
>;

const INSTALLED_APPLICATION_ID = 'installed-app-id';

const INSTALLED_APPLICATION: TestApplication = {
  id: INSTALLED_APPLICATION_ID,
  name: 'Installed app',
  defaultRoleId: 'installed-app-role-id',
  deletedAt: null,
};

const resolve = (application: TestApplication | null) =>
  resolveWorkflowRunApplicationOrThrow({
    applicationId: INSTALLED_APPLICATION_ID,
    applicationsById: application ? { [application.id]: application } : {},
  });

describe('resolveWorkflowRunApplicationOrThrow', () => {
  it('returns the application the run acts through', () => {
    expect(resolve(INSTALLED_APPLICATION)).toBe(INSTALLED_APPLICATION);
  });

  it('refuses a run whose application is no longer installed', () => {
    expect(() => resolve(null)).toThrow('no longer installed');

    expect(() =>
      resolve({ ...INSTALLED_APPLICATION, deletedAt: new Date() }),
    ).toThrow('no longer installed');
  });

  it('refuses a run whose application has no role rather than widening it', () => {
    expect(() =>
      resolve({ ...INSTALLED_APPLICATION, defaultRoleId: null }),
    ).toThrow('has no role');
  });
});
