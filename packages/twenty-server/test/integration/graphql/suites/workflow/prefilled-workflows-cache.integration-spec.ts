import { createPermissionTestActiveWorkspace } from 'test/integration/permissions/utils/create-permission-test-active-workspace.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkflowPrefillIds } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflows.util';

const getPrefilledWorkflowCacheEntries = async (workspaceId: string) => {
  const {
    coreQuickLeadWorkflowId,
    coreCreateCompanyWorkflowId,
    coreQuickLeadWorkflowVersionId,
    coreCreateCompanyWorkflowVersionId,
  } = getWorkflowPrefillIds(workspaceId);

  const { flatWorkflowMaps, flatWorkflowVersionMaps } =
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).getOrRecompute(workspaceId, [
      'flatWorkflowMaps',
      'flatWorkflowVersionMaps',
    ]);

  const findWorkflow = (flatEntityId: string) =>
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: flatWorkflowMaps,
    });

  const findWorkflowVersion = (flatEntityId: string) =>
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: flatWorkflowVersionMaps,
    });

  return {
    workflows: [
      findWorkflow(coreQuickLeadWorkflowId),
      findWorkflow(coreCreateCompanyWorkflowId),
    ],
    workflowVersions: [
      findWorkflowVersion(coreQuickLeadWorkflowVersionId),
      findWorkflowVersion(coreCreateCompanyWorkflowVersionId),
    ],
  };
};

describe('Prefilled workflows workspace cache (integration)', () => {
  it('should cache the workflows prefilled on workspace activation', async () => {
    const { workspaceId } = await createPermissionTestActiveWorkspace();

    const { workflows, workflowVersions } =
      await getPrefilledWorkflowCacheEntries(workspaceId);

    expect(workflows.map((workflow) => workflow?.name)).toEqual([
      'Quick Lead',
      'Create company when adding a new person',
    ]);
    expect(
      workflowVersions.map((workflowVersion) => workflowVersion?.status),
    ).toEqual(['ACTIVE', 'ACTIVE']);
  });

  it('should cache the workflows prefilled by the dev seeder', async () => {
    const { workflows } = await getPrefilledWorkflowCacheEntries(
      SEED_APPLE_WORKSPACE_ID,
    );

    expect(workflows.map((workflow) => workflow?.name)).toEqual([
      'Quick Lead',
      'Create company when adding a new person',
    ]);
  });
});
