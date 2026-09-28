import { FieldActorSource } from 'twenty-shared/types';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveWorkflowRunStartingApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-starting-application.util';

const INSTALLED_APPLICATION = {
  id: 'installed-app-id',
  name: 'Installed app',
  defaultRoleId: 'installed-app-role-id',
  deletedAt: null,
} as unknown as FlatApplication;

const FLAT_APPLICATION_MAPS: FlatApplicationCacheMaps = {
  byId: { [INSTALLED_APPLICATION.id]: INSTALLED_APPLICATION },
  idByUniversalIdentifier: {},
};

const resolve = (applicationId?: string) =>
  resolveWorkflowRunStartingApplication({
    workflowRun: {
      createdBy: {
        source: FieldActorSource.MANUAL,
        workspaceMemberId: 'member-id',
        name: 'Jane Austen',
        context: { applicationId },
      },
    },
    flatApplicationMaps: FLAT_APPLICATION_MAPS,
    workspaceOwnedApplicationIds: ['custom-app-id', 'standard-app-id'],
  });

describe('resolveWorkflowRunStartingApplication', () => {
  it('returns nothing for a run a member started directly', () => {
    expect(resolve()).toBeNull();
  });

  it('ignores the workspace own applications', () => {
    expect(resolve('custom-app-id')).toBeNull();
  });

  it('returns the installed application whose token started the run', () => {
    expect(resolve('installed-app-id')).toBe(INSTALLED_APPLICATION);
  });

  it('fails closed when that application is uninstalled', () => {
    expect(() => resolve('uninstalled-app-id')).toThrow(
      'The application that started this run is no longer installed',
    );
  });
});
