import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { WorkspaceFlatRoleTargetByApplicationIdMapCacheService } from 'src/engine/metadata-modules/role-target/services/workspace-flat-role-target-by-application-id-map-cache.service';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const buildFlatRoleTarget = (
  overrides: Partial<FlatRoleTarget>,
): FlatRoleTarget =>
  ({
    id: 'role-target-id',
    universalIdentifier: 'role-target-universal-identifier',
    roleId: 'role-id',
    agentId: null,
    userWorkspaceId: null,
    apiKeyId: null,
    webhookId: null,
    targetApplicationId: null,
    ...overrides,
  }) as FlatRoleTarget;

const buildFlatRoleTargetMaps = (
  flatRoleTargets: FlatRoleTarget[],
): WorkspaceCacheDataMap['flatRoleTargetMaps'] => ({
  byUniversalIdentifier: Object.fromEntries(
    flatRoleTargets.map((flatRoleTarget) => [
      flatRoleTarget.universalIdentifier,
      flatRoleTarget,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatRoleTargets.map((flatRoleTarget) => [
      flatRoleTarget.id,
      flatRoleTarget.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('WorkspaceFlatRoleTargetByApplicationIdMapCacheService', () => {
  const service = new WorkspaceFlatRoleTargetByApplicationIdMapCacheService();

  it('indexes application role targets by their target application', () => {
    const applicationRoleTarget = buildFlatRoleTarget({
      id: 'application-role-target-id',
      universalIdentifier: 'application-role-target',
      roleId: 'grant-role-id',
      targetApplicationId: 'application-id',
    });

    const flatRoleTargetByApplicationIdMaps = service.getFromSource(
      buildFlatRoleTargetMaps([
        applicationRoleTarget,
        buildFlatRoleTarget({
          id: 'agent-role-target-id',
          universalIdentifier: 'agent-role-target',
          agentId: 'agent-id',
        }),
      ]),
    );

    expect(flatRoleTargetByApplicationIdMaps).toEqual({
      'application-id': applicationRoleTarget,
    });
  });

  it('recomputes once the role targets change', () => {
    const before = service.getFromSource(buildFlatRoleTargetMaps([]));
    const after = service.getFromSource(
      buildFlatRoleTargetMaps([
        buildFlatRoleTarget({
          universalIdentifier: 'application-role-target',
          roleId: 'grant-role-id',
          targetApplicationId: 'application-id',
        }),
      ]),
    );

    expect(before).toEqual({});
    expect(after['application-id']?.roleId).toBe('grant-role-id');
  });
});
