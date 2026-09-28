import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkflowMaps } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow-maps.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
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

const buildFlatWorkflowMaps = (
  workflows: Pick<
    FlatWorkflow,
    'id' | 'universalIdentifier' | 'applicationId'
  >[],
): FlatWorkflowMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      workflows.map((workflow) => [workflow.universalIdentifier, workflow]),
    ),
    universalIdentifierById: Object.fromEntries(
      workflows.map((workflow) => [workflow.id, workflow.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatWorkflowMaps;

const FLAT_WORKFLOW_MAPS = buildFlatWorkflowMaps([
  {
    id: 'workspace-workflow-id',
    universalIdentifier: 'workspace-workflow',
    applicationId: CUSTOM_APPLICATION_ID,
  },
  {
    id: 'standard-workflow-id',
    universalIdentifier: 'standard-workflow',
    applicationId: STANDARD_APPLICATION_ID,
  },
  {
    id: 'app-workflow-id',
    universalIdentifier: 'app-workflow',
    applicationId: INSTALLED_APPLICATION_ID,
  },
]);

const FLAT_APPLICATION_MAPS: FlatApplicationCacheMaps = {
  byId: { [INSTALLED_APPLICATION_ID]: INSTALLED_APPLICATION },
  idByUniversalIdentifier: {},
};

const resolve = ({
  coreWorkflowId,
  flatApplicationMaps = FLAT_APPLICATION_MAPS,
}: {
  coreWorkflowId: string | null;
  flatApplicationMaps?: FlatApplicationCacheMaps;
}) =>
  resolveWorkflowRunOwningApplication({
    workflowRun: { coreWorkflowId },
    flatWorkflowMaps: FLAT_WORKFLOW_MAPS,
    flatApplicationMaps,
    workspaceOwnedApplicationIds: [
      CUSTOM_APPLICATION_ID,
      STANDARD_APPLICATION_ID,
    ],
  });

describe('resolveWorkflowRunOwningApplication', () => {
  it('treats workspace and standard workflows as owned by the workspace', () => {
    expect(resolve({ coreWorkflowId: 'workspace-workflow-id' })).toBeNull();
    expect(resolve({ coreWorkflowId: 'standard-workflow-id' })).toBeNull();
  });

  it('treats runs that predate core workflows as owned by the workspace', () => {
    expect(resolve({ coreWorkflowId: null })).toBeNull();
  });

  it('returns the installed application that owns the workflow', () => {
    expect(resolve({ coreWorkflowId: 'app-workflow-id' })).toBe(
      INSTALLED_APPLICATION,
    );
  });

  it('fails closed when the workflow is deleted or belongs to another workspace', () => {
    expect(() =>
      resolve({ coreWorkflowId: 'other-workspace-workflow-id' }),
    ).toThrow('The workflow of this run no longer exists');
  });

  it('fails closed when the owning application is uninstalled', () => {
    expect(() =>
      resolve({
        coreWorkflowId: 'app-workflow-id',
        flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
      }),
    ).toThrow('The application that owns this workflow is no longer installed');
    expect(() =>
      resolve({
        coreWorkflowId: 'app-workflow-id',
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
