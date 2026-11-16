import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const ROLE_IDS = ['assigned-role', 'extra-role', 'other-role'];

const buildMaps = <TEntity extends { id: string; universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildRoleTarget = ({
  roleId,
  isSystemSideEffect,
}: {
  roleId: string;
  isSystemSideEffect: boolean;
}) =>
  ({
    id: `${roleId}-target`,
    universalIdentifier: `${roleId}-target`,
    roleId,
    isSystemSideEffect,
    userWorkspaceId: USER_WORKSPACE_ID,
  }) as FlatRoleTarget;

const assignedRoleTarget = buildRoleTarget({
  roleId: 'assigned-role',
  isSystemSideEffect: false,
});
const extraRoleTarget = buildRoleTarget({
  roleId: 'extra-role',
  isSystemSideEffect: true,
});

const createRoleTarget = ({
  roleId,
  isSystemSideEffect,
}: {
  roleId: string;
  isSystemSideEffect?: boolean;
}) =>
  fromCreateRoleTargetInputToFlatRoleTargetToCreate({
    createRoleTargetInput: {
      roleId,
      targetId: USER_WORKSPACE_ID,
      targetMetadataForeignKey: 'userWorkspaceId',
      isSystemSideEffect,
    },
    workspaceId: 'workspace-1',
    flatApplication: {
      id: 'application-1',
      universalIdentifier: '20202020-0000-4000-8000-000000000001',
    } as FlatApplication,
    flatRoleTargetMaps: buildMaps([
      assignedRoleTarget,
      extraRoleTarget,
    ]) as unknown as AllFlatEntityMaps['flatRoleTargetMaps'],
    flatRoleMaps: buildMaps(
      ROLE_IDS.map((id) => ({ id, universalIdentifier: id })),
    ) as unknown as AllFlatEntityMaps['flatRoleMaps'],
    flatAgentMaps: buildMaps(
      [],
    ) as unknown as AllFlatEntityMaps['flatAgentMaps'],
    flatWebhookMaps: buildMaps(
      [],
    ) as unknown as AllFlatEntityMaps['flatWebhookMaps'],
  });

describe('fromCreateRoleTargetInputToFlatRoleTargetToCreate', () => {
  it('replaces the assigned role and keeps the system held ones', () => {
    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      createRoleTarget({ roleId: 'other-role' });

    expect(flatRoleTargetToCreate.isSystemSideEffect).toBe(false);
    expect(flatRoleTargetsToDelete).toEqual([assignedRoleTarget]);
  });

  it('also replaces the system held target of the role being assigned', () => {
    const { flatRoleTargetsToDelete } = createRoleTarget({
      roleId: 'extra-role',
    });

    expect(flatRoleTargetsToDelete).toEqual([
      assignedRoleTarget,
      extraRoleTarget,
    ]);
  });

  it('adds a system held role without replacing anything, under an identifier it can compute again', () => {
    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      createRoleTarget({ roleId: 'other-role', isSystemSideEffect: true });

    expect(flatRoleTargetToCreate.isSystemSideEffect).toBe(true);
    expect(flatRoleTargetsToDelete).toEqual([]);
    expect(flatRoleTargetToCreate.universalIdentifier).toBe(
      createRoleTarget({ roleId: 'other-role', isSystemSideEffect: true })
        .flatRoleTargetToCreate.universalIdentifier,
    );
    expect(flatRoleTargetToCreate.universalIdentifier).not.toBe(
      createRoleTarget({ roleId: 'assigned-role', isSystemSideEffect: true })
        .flatRoleTargetToCreate.universalIdentifier,
    );
  });
});
