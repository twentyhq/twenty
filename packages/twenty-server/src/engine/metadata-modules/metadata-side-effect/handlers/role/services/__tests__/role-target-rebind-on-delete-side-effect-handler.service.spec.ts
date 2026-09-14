import { RoleTargetRebindOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/role/services/role-target-rebind-on-delete-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a0a0a0a0-a0a0-4000-8000-000000000001';
const DELETED_ROLE_ID = 'b0b0b0b0-b0b0-4000-8000-000000000001';
const DELETED_ROLE_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000001';
const DEFAULT_ROLE_ID = 'b0b0b0b0-b0b0-4000-8000-000000000002';
const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';
const STALE_DEFAULT_ROLE_ID = 'b0b0b0b0-b0b0-4000-8000-000000000003';
const AGENT_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const ACTIVE_API_KEY_ID = 'e0e0e0e0-e0e0-4000-8000-000000000002';

type FlatRoleTargetFixture = {
  id: string;
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  roleId: string;
  roleUniversalIdentifier: string;
  userWorkspaceId: string | null;
  apiKeyId: string | null;
  agentId: string | null;
  agentUniversalIdentifier: string | null;
};

type FlatRoleFixture = {
  id: string;
  universalIdentifier: string;
  isEditable: boolean;
  roleTargetUniversalIdentifiers: string[];
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
};

const USER_FLAT_ROLE_TARGET: FlatRoleTargetFixture = {
  id: 'c0c0c0c0-c0c0-4000-8000-000000000001',
  universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  roleId: DELETED_ROLE_ID,
  roleUniversalIdentifier: DELETED_ROLE_UNIVERSAL_IDENTIFIER,
  userWorkspaceId: 'e0e0e0e0-e0e0-4000-8000-000000000001',
  apiKeyId: null,
  agentId: null,
  agentUniversalIdentifier: null,
};

const API_KEY_FLAT_ROLE_TARGET: FlatRoleTargetFixture = {
  ...USER_FLAT_ROLE_TARGET,
  id: 'c0c0c0c0-c0c0-4000-8000-000000000002',
  universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000002',
  userWorkspaceId: null,
  apiKeyId: ACTIVE_API_KEY_ID,
};

const AGENT_FLAT_ROLE_TARGET: FlatRoleTargetFixture = {
  ...USER_FLAT_ROLE_TARGET,
  id: 'c0c0c0c0-c0c0-4000-8000-000000000003',
  universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000003',
  userWorkspaceId: null,
  agentId: 'e0e0e0e0-e0e0-4000-8000-000000000003',
  agentUniversalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
};

const ALL_FLAT_ROLE_TARGETS = [
  USER_FLAT_ROLE_TARGET,
  API_KEY_FLAT_ROLE_TARGET,
  AGENT_FLAT_ROLE_TARGET,
];

const DELETED_FLAT_ROLE: FlatRoleFixture = {
  id: DELETED_ROLE_ID,
  universalIdentifier: DELETED_ROLE_UNIVERSAL_IDENTIFIER,
  isEditable: true,
  roleTargetUniversalIdentifiers: ALL_FLAT_ROLE_TARGETS.map(
    ({ universalIdentifier }) => universalIdentifier,
  ),
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
};

const DEFAULT_FLAT_ROLE: FlatRoleFixture = {
  id: DEFAULT_ROLE_ID,
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  isEditable: true,
  roleTargetUniversalIdentifiers: [],
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
};

const EMPTY_FLAT_ENTITY_OPERATION_RECORD = {
  flatEntityToCreate: {},
  flatEntityToUpdate: {},
  flatEntityToDelete: {},
};

type BuildArgsOverrides = {
  workspaceDefaultRoleId?: string | null;
  activeApiKeyIds?: string[];
  isSystemBuild?: boolean;
  flatRoles?: FlatRoleFixture[];
  allFlatEntityOperationRecordByMetadataName?: Record<string, unknown>;
};

const buildArgs = ({
  workspaceDefaultRoleId = DEFAULT_ROLE_ID,
  activeApiKeyIds = [ACTIVE_API_KEY_ID],
  isSystemBuild = false,
  flatRoles = [DELETED_FLAT_ROLE, DEFAULT_FLAT_ROLE],
  allFlatEntityOperationRecordByMetadataName = {},
}: BuildArgsOverrides = {}): BuildSideEffectsArgs<'role'> =>
  ({
    flatEntity: {
      universalIdentifier: DELETED_ROLE_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      roleTargetUniversalIdentifiers: [],
    },
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatRoleMaps: {
        byUniversalIdentifier: Object.fromEntries(
          flatRoles.map((flatRole) => [
            flatRole.universalIdentifier,
            {
              applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
              ...flatRole,
            },
          ]),
        ),
        universalIdentifierById: Object.fromEntries(
          flatRoles.map((flatRole) => [
            flatRole.id,
            flatRole.universalIdentifier,
          ]),
        ),
      },
      flatRoleTargetMaps: {
        byUniversalIdentifier: Object.fromEntries(
          ALL_FLAT_ROLE_TARGETS.map((flatRoleTarget) => [
            flatRoleTarget.universalIdentifier,
            flatRoleTarget,
          ]),
        ),
      },
    },
    context: {
      buildOptions: {
        isSystemBuild,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      workspaceDefaultRoleId,
      activeApiKeyIds,
    },
  }) as unknown as BuildSideEffectsArgs<'role'>;

const toReboundFlatRoleTarget = (flatRoleTarget: FlatRoleTargetFixture) => ({
  ...flatRoleTarget,
  roleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});

const buildExpectedRebind = (flatRoleTargets: FlatRoleTargetFixture[]) => ({
  status: 'success',
  operations: {
    roleTarget: {
      flatEntityToUpdate: Object.fromEntries(
        flatRoleTargets.map((flatRoleTarget) => [
          flatRoleTarget.universalIdentifier,
          toReboundFlatRoleTarget(flatRoleTarget),
        ]),
      ),
    },
  },
});

describe('RoleTargetRebindOnDeleteSideEffectHandlerService', () => {
  const handler =
    new (RoleTargetRebindOnDeleteSideEffectHandlerService as unknown as new () => RoleTargetRebindOnDeleteSideEffectHandlerService)();

  it('should rebind user, API key and agent role targets read from the cached role to the workspace default role even when the trigger role carries none', () => {
    expect(handler.buildSideEffects(buildArgs())).toEqual(
      buildExpectedRebind(ALL_FLAT_ROLE_TARGETS),
    );
  });

  it.each<[string, BuildArgsOverrides]>([
    ['the workspace has no default role', { workspaceDefaultRoleId: null }],
    [
      'the workspace default role id resolves to no role',
      { workspaceDefaultRoleId: STALE_DEFAULT_ROLE_ID },
    ],
    [
      'the deleted role is the workspace default role',
      { workspaceDefaultRoleId: DELETED_ROLE_ID },
    ],
    [
      'the workspace default role is deleted in the same migration',
      {
        allFlatEntityOperationRecordByMetadataName: {
          role: {
            ...EMPTY_FLAT_ENTITY_OPERATION_RECORD,
            flatEntityToDelete: {
              [DEFAULT_ROLE_UNIVERSAL_IDENTIFIER]: DEFAULT_FLAT_ROLE,
            },
          },
        },
      },
    ],
    [
      'the deleted role is not editable on a non-system build',
      {
        flatRoles: [
          { ...DELETED_FLAT_ROLE, isEditable: false },
          DEFAULT_FLAT_ROLE,
        ],
      },
    ],
    [
      'the deleted role has no role targets',
      {
        flatRoles: [
          { ...DELETED_FLAT_ROLE, roleTargetUniversalIdentifiers: [] },
          DEFAULT_FLAT_ROLE,
        ],
      },
    ],
    [
      'every role target of the deleted role is already handled by another operation',
      {
        allFlatEntityOperationRecordByMetadataName: {
          roleTarget: {
            ...EMPTY_FLAT_ENTITY_OPERATION_RECORD,
            flatEntityToDelete: Object.fromEntries(
              ALL_FLAT_ROLE_TARGETS.map((flatRoleTarget) => [
                flatRoleTarget.universalIdentifier,
                flatRoleTarget,
              ]),
            ),
          },
        },
      },
    ],
  ])('should noop when %s', (_, overrides) => {
    expect(handler.buildSideEffects(buildArgs(overrides))).toEqual({
      status: 'noop',
    });
  });

  it('should still rebind the role targets of a non-editable role on a system build', () => {
    expect(
      handler.buildSideEffects(
        buildArgs({
          isSystemBuild: true,
          flatRoles: [
            { ...DELETED_FLAT_ROLE, isEditable: false },
            DEFAULT_FLAT_ROLE,
          ],
        }),
      ),
    ).toEqual(buildExpectedRebind(ALL_FLAT_ROLE_TARGETS));
  });

  it.each([
    'flatEntityToCreate',
    'flatEntityToUpdate',
    'flatEntityToDelete',
  ] as const)(
    'should leave a role target already present in the roleTarget %s bucket to that operation',
    (bucketName) => {
      expect(
        handler.buildSideEffects(
          buildArgs({
            allFlatEntityOperationRecordByMetadataName: {
              roleTarget: {
                ...EMPTY_FLAT_ENTITY_OPERATION_RECORD,
                [bucketName]: {
                  [USER_FLAT_ROLE_TARGET.universalIdentifier]:
                    USER_FLAT_ROLE_TARGET,
                },
              },
            },
          }),
        ),
      ).toEqual(
        buildExpectedRebind([API_KEY_FLAT_ROLE_TARGET, AGENT_FLAT_ROLE_TARGET]),
      );
    },
  );

  it('should leave an agent role target to go away with its agent when the agent is deleted in the same migration', () => {
    expect(
      handler.buildSideEffects(
        buildArgs({
          allFlatEntityOperationRecordByMetadataName: {
            agent: {
              ...EMPTY_FLAT_ENTITY_OPERATION_RECORD,
              flatEntityToDelete: {
                [AGENT_UNIVERSAL_IDENTIFIER]: {
                  universalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
                },
              },
            },
          },
        }),
      ),
    ).toEqual(
      buildExpectedRebind([USER_FLAT_ROLE_TARGET, API_KEY_FLAT_ROLE_TARGET]),
    );
  });

  it('should leave an API key role target alone when its key is revoked or gone', () => {
    expect(
      handler.buildSideEffects(buildArgs({ activeApiKeyIds: [] })),
    ).toEqual(
      buildExpectedRebind([USER_FLAT_ROLE_TARGET, AGENT_FLAT_ROLE_TARGET]),
    );
  });

  it('should still emit the rebind when the default role cannot be assigned to API keys or agents, leaving the rejection to the role target validator', () => {
    expect(
      handler.buildSideEffects(
        buildArgs({
          flatRoles: [
            DELETED_FLAT_ROLE,
            {
              ...DEFAULT_FLAT_ROLE,
              canBeAssignedToAgents: false,
              canBeAssignedToApiKeys: false,
            },
          ],
        }),
      ),
    ).toEqual(buildExpectedRebind(ALL_FLAT_ROLE_TARGETS));
  });
});
