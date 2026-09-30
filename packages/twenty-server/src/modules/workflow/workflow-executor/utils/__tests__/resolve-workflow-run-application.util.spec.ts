import { FieldActorSource } from 'twenty-shared/types';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveWorkflowRunApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-application.util';

const INSTALLED_APPLICATION_ID = 'installed-app-id';

const INSTALLED_APPLICATION = {
  id: INSTALLED_APPLICATION_ID,
  name: 'Installed app',
  defaultRoleId: 'installed-app-role-id',
  deletedAt: null,
} as unknown as FlatApplication;

const resolve = ({
  applicationId,
  application = INSTALLED_APPLICATION,
}: {
  applicationId?: string;
  application?: FlatApplication | null;
}) => {
  const flatApplicationMaps: FlatApplicationCacheMaps = {
    byId: application ? { [application.id]: application } : {},
    idByUniversalIdentifier: {},
  };

  return resolveWorkflowRunApplication({
    workflowRun: {
      createdBy: {
        source: FieldActorSource.MANUAL,
        workspaceMemberId: 'member-id',
        name: 'Tim Apple',
        context: { applicationId },
      },
    },
    flatApplicationMaps,
  });
};

describe('resolveWorkflowRunApplication', () => {
  it('leaves a run that no application bounds unbound', () => {
    expect(resolve({})).toBeNull();
  });

  it('returns the application the run was bound to', () => {
    expect(resolve({ applicationId: INSTALLED_APPLICATION_ID })).toBe(
      INSTALLED_APPLICATION,
    );
  });

  it('refuses a run whose application is no longer installed', () => {
    expect(() =>
      resolve({ applicationId: INSTALLED_APPLICATION_ID, application: null }),
    ).toThrow('no longer installed');

    expect(() =>
      resolve({
        applicationId: INSTALLED_APPLICATION_ID,
        application: {
          ...INSTALLED_APPLICATION,
          deletedAt: new Date().toISOString(),
        } as unknown as FlatApplication,
      }),
    ).toThrow('no longer installed');
  });

  it('refuses a run whose application has no role rather than widening it', () => {
    expect(() =>
      resolve({
        applicationId: INSTALLED_APPLICATION_ID,
        application: {
          ...INSTALLED_APPLICATION,
          defaultRoleId: null,
        } as unknown as FlatApplication,
      }),
    ).toThrow('has no role');
  });
});
