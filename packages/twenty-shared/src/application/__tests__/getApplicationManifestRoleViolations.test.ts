import { type AgentManifest } from '@/application/agentManifestType';
import { type LegacyCompliantRoleManifest } from '@/application/roleManifestType';
import {
  formatApplicationManifestRoleViolation,
  getApplicationManifestRoleViolations,
} from '@/application/utils/getApplicationManifestRoleViolations';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '@/types';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const REQUESTED_ROLE = 'requested-role';
const AGENT_ROLE = 'agent-role';

const role = (
  universalIdentifier: string,
  properties: Partial<LegacyCompliantRoleManifest> = {},
): LegacyCompliantRoleManifest => ({
  universalIdentifier,
  label: universalIdentifier,
  ...properties,
});

const agent = (roleUniversalIdentifier?: string): AgentManifest => ({
  universalIdentifier: `agent-${roleUniversalIdentifier}`,
  name: 'agent',
  label: 'Agent',
  prompt: 'prompt',
  roleUniversalIdentifier,
});

const getViolations = ({
  roles,
  agents = [],
  defaultRoleUniversalIdentifier = REQUESTED_ROLE,
}: {
  roles: LegacyCompliantRoleManifest[];
  agents?: AgentManifest[];
  defaultRoleUniversalIdentifier?: string;
}) =>
  getApplicationManifestRoleViolations({
    manifest: {
      application: {
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        defaultRoleUniversalIdentifier,
      } as Parameters<
        typeof getApplicationManifestRoleViolations
      >[0]['manifest']['application'],
      roles,
      agents,
    },
  });

const RULE = {
  universalIdentifier: 'rule',
  canReadRecords: true,
  predicates: [
    {
      universalIdentifier: 'predicate',
      fieldUniversalIdentifier: 'owner',
      operand: RowLevelPermissionPredicateOperand.IS,
      value: 'me',
    },
  ],
};

describe('getApplicationManifestRoleViolations', () => {
  it('should find nothing when the requested and agent roles only grant objects', () => {
    expect(
      getViolations({
        roles: [
          role(REQUESTED_ROLE, {
            canReadAllObjectRecords: true,
            objectPermissions: [
              {
                objectUniversalIdentifier: 'company',
                canUpdateObjectRecords: true,
              },
            ],
            fieldPermissions: [],
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          }),
          role(AGENT_ROLE, {
            recordsPermissions: {
              objects: [
                {
                  objectUniversalIdentifier: 'person',
                  canReadAllRecords: true,
                  unreadableFields: [],
                  rowLevelRecordsPermissions: [],
                },
              ],
            },
          }),
        ],
        agents: [agent(AGENT_ROLE), agent()],
      }),
    ).toEqual([]);
  });

  it('should report a standalone role without inspecting its permissions', () => {
    expect(
      getViolations({
        roles: [
          role(REQUESTED_ROLE),
          role('member-role', {
            fieldPermissions: [
              {
                objectUniversalIdentifier: 'company',
                fieldUniversalIdentifier: 'secret',
                canReadFieldValue: false,
              },
            ],
          }),
        ],
      }),
    ).toEqual([
      {
        kind: 'standaloneRole',
        roleUniversalIdentifier: 'member-role',
        roleLabel: 'member-role',
      },
    ]);
  });

  it('should treat a role an agent uses as an agent role', () => {
    expect(
      getViolations({
        roles: [role(REQUESTED_ROLE), role(AGENT_ROLE)],
        agents: [agent(AGENT_ROLE)],
      }),
    ).toEqual([]);
  });

  it('should treat every role as standalone when the app has no requested role', () => {
    expect(
      getViolations({
        roles: [role(REQUESTED_ROLE)],
        defaultRoleUniversalIdentifier: 'missing-role',
      }).map(({ kind }) => kind),
    ).toEqual(['standaloneRole']);
  });

  it('should report row-level rules declared in recordsPermissions', () => {
    expect(
      getViolations({
        roles: [
          role(REQUESTED_ROLE, {
            recordsPermissions: {
              objects: [
                {
                  objectUniversalIdentifier: 'company',
                  rowLevelRecordsPermissions: [RULE],
                },
              ],
            },
          }),
        ],
      }),
    ).toEqual([
      {
        kind: 'rowLevelRules',
        roleUniversalIdentifier: REQUESTED_ROLE,
        roleLabel: REQUESTED_ROLE,
        roleKinds: ['requested'],
        objectUniversalIdentifiers: ['company'],
      },
    ]);
  });

  it('should report row-level rules declared with the legacy predicates and predicate groups', () => {
    expect(
      getViolations({
        roles: [
          role(AGENT_ROLE, {
            rowLevelPermissionPredicateGroups: [
              {
                universalIdentifier: 'group',
                objectUniversalIdentifier: 'person',
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
              },
            ],
            rowLevelPermissionPredicates: [
              {
                universalIdentifier: 'predicate',
                objectUniversalIdentifier: 'person',
                fieldUniversalIdentifier: 'owner',
                operand: RowLevelPermissionPredicateOperand.IS,
                value: 'me',
                predicateGroupUniversalIdentifier: 'group',
              },
              {
                universalIdentifier: 'other-predicate',
                objectUniversalIdentifier: 'company',
                fieldUniversalIdentifier: 'owner',
                operand: RowLevelPermissionPredicateOperand.IS,
                value: 'me',
              },
            ],
          }),
        ],
        agents: [agent(AGENT_ROLE)],
      }),
    ).toEqual([
      {
        kind: 'rowLevelRules',
        roleUniversalIdentifier: AGENT_ROLE,
        roleLabel: AGENT_ROLE,
        roleKinds: ['agent'],
        objectUniversalIdentifiers: ['person', 'company'],
      },
    ]);
  });

  it('should report field permissions declared on an object or on one of its rules in recordsPermissions', () => {
    expect(
      getViolations({
        roles: [
          role(REQUESTED_ROLE, {
            recordsPermissions: {
              objects: [
                {
                  objectUniversalIdentifier: 'company',
                  uneditableFields: ['secret'],
                },
                {
                  objectUniversalIdentifier: 'person',
                  rowLevelRecordsPermissions: [
                    { ...RULE, unreadableFields: ['email'] },
                  ],
                },
              ],
            },
          }),
        ],
      }).filter(({ kind }) => kind === 'fieldPermissions'),
    ).toEqual([
      {
        kind: 'fieldPermissions',
        roleUniversalIdentifier: REQUESTED_ROLE,
        roleLabel: REQUESTED_ROLE,
        roleKinds: ['requested'],
        objectUniversalIdentifiers: ['company', 'person'],
      },
    ]);
  });

  it('should report field permissions declared with the legacy fieldPermissions', () => {
    expect(
      getViolations({
        roles: [
          role(REQUESTED_ROLE, {
            fieldPermissions: [
              {
                objectUniversalIdentifier: 'company',
                fieldUniversalIdentifier: 'secret',
                canUpdateFieldValue: false,
              },
            ],
          }),
        ],
        agents: [agent(REQUESTED_ROLE)],
      }),
    ).toEqual([
      {
        kind: 'fieldPermissions',
        roleUniversalIdentifier: REQUESTED_ROLE,
        roleLabel: REQUESTED_ROLE,
        roleKinds: ['requested', 'agent'],
        objectUniversalIdentifiers: ['company'],
      },
    ]);
  });
});

describe('formatApplicationManifestRoleViolation', () => {
  it('should name the role, its kinds and what it declares', () => {
    expect(
      formatApplicationManifestRoleViolation({
        kind: 'fieldPermissions',
        roleUniversalIdentifier: REQUESTED_ROLE,
        roleLabel: 'Requested',
        roleKinds: ['requested', 'agent'],
        objectUniversalIdentifiers: ['company'],
      }),
    ).toBe(
      'Role "Requested" (requested-role), the application and agent role, declares field permissions on objects company. Marketplace applications cannot declare field permissions: the workspace configures them.',
    );
  });
});
