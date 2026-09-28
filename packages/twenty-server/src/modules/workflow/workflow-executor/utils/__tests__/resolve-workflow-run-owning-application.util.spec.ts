import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveWorkflowRunOwningApplication } from 'src/modules/workflow/workflow-executor/utils/resolve-workflow-run-owning-application.util';

const CUSTOM_APPLICATION_ID = 'custom-app-id';
const STANDARD_APPLICATION_ID = 'standard-app-id';
const INSTALLED_APPLICATION_ID = 'installed-app-id';

const INSTALLED_APPLICATION = {
  id: INSTALLED_APPLICATION_ID,
  name: 'Installed app',
  defaultRoleId: 'installed-app-role-id',
  deletedAt: null,
} as unknown as FlatApplication;

const FLAT_APPLICATION_MAPS: FlatApplicationCacheMaps = {
  byId: { [INSTALLED_APPLICATION_ID]: INSTALLED_APPLICATION },
  idByUniversalIdentifier: {},
};

const resolve = ({
  coreWorkflowId = 'core-workflow-id',
  applicationId,
  flatApplicationMaps = FLAT_APPLICATION_MAPS,
}: {
  coreWorkflowId?: string | null;
  applicationId?: string;
  flatApplicationMaps?: FlatApplicationCacheMaps;
}) =>
  resolveWorkflowRunOwningApplication({
    workflowRun: { coreWorkflowId },
    coreWorkflow: applicationId === undefined ? null : { applicationId },
    flatApplicationMaps,
    workspaceOwnedApplicationIds: [
      CUSTOM_APPLICATION_ID,
      STANDARD_APPLICATION_ID,
    ],
  });

describe('resolveWorkflowRunOwningApplication', () => {
  it('treats workspace and standard workflows as owned by the workspace', () => {
    expect(resolve({ applicationId: CUSTOM_APPLICATION_ID })).toBeNull();
    expect(resolve({ applicationId: STANDARD_APPLICATION_ID })).toBeNull();
  });

  it('treats runs that predate core workflows as owned by the workspace', () => {
    expect(resolve({ coreWorkflowId: null })).toBeNull();
  });

  it('returns the installed application that owns the workflow', () => {
    expect(resolve({ applicationId: INSTALLED_APPLICATION_ID })).toBe(
      INSTALLED_APPLICATION,
    );
  });

  it('fails closed when the workflow is deleted or belongs to another workspace', () => {
    expect(() => resolve({})).toThrow(
      'The workflow of this run no longer exists',
    );
  });

  it('fails closed when the owning application is uninstalled', () => {
    expect(() =>
      resolve({
        applicationId: INSTALLED_APPLICATION_ID,
        flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
      }),
    ).toThrow('The application that owns this workflow is no longer installed');
    expect(() =>
      resolve({
        applicationId: INSTALLED_APPLICATION_ID,
        flatApplicationMaps: {
          byId: {
            [INSTALLED_APPLICATION_ID]: {
              ...INSTALLED_APPLICATION,
              deletedAt: '2026-09-28T00:00:00.000Z',
            } as unknown as FlatApplication,
          },
          idByUniversalIdentifier: {},
        },
      }),
    ).toThrow('The application that owns this workflow is no longer installed');
  });
});
