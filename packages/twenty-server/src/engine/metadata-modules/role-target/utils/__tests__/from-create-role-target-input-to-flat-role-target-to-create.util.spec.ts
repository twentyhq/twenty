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
  isAdditional,
}: {
  roleId: string;
  isAdditional: boolean;
}) =>
  ({
    id: `${roleId}-target`,
    universalIdentifier: `${roleId}-target`,
    roleId,
    isAdditional,
    userWorkspaceId: USER_WORKSPACE_ID,
  }) as FlatRoleTarget;

const assignedRoleTarget = buildRoleTarget({
  roleId: 'assigned-role',
  isAdditional: false,
});
const extraRoleTarget = buildRoleTarget({
  roleId: 'extra-role',
  isAdditional: true,
});

const createRoleTarget = ({
  roleId,
  isAdditional,
}: {
  roleId: string;
  isAdditional?: boolean;
}) =>
  fromCreateRoleTargetInputToFlatRoleTargetToCreate({
    createRoleTargetInput: {
      roleId,
      targetId: USER_WORKSPACE_ID,
      targetMetadataForeignKey: 'userWorkspaceId',
      isAdditional,
    },
    workspaceId: 'workspace-1',
    flatApplication: {
      id: 'application-1',
      universalIdentifier: 'application-1',
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
  it('replaces the assigned role and keeps the additional ones', () => {
    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      createRoleTarget({ roleId: 'other-role' });

    expect(flatRoleTargetToCreate.isAdditional).toBe(false);
    expect(flatRoleTargetsToDelete).toEqual([assignedRoleTarget]);
  });

  it('also replaces the additional target of the role being assigned', () => {
    const { flatRoleTargetsToDelete } = createRoleTarget({
      roleId: 'extra-role',
    });

    expect(flatRoleTargetsToDelete).toEqual([
      assignedRoleTarget,
      extraRoleTarget,
    ]);
  });

  it('adds an additional role without replacing anything', () => {
    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      createRoleTarget({ roleId: 'other-role', isAdditional: true });

    expect(flatRoleTargetToCreate.isAdditional).toBe(true);
    expect(flatRoleTargetsToDelete).toEqual([]);
  });
});
