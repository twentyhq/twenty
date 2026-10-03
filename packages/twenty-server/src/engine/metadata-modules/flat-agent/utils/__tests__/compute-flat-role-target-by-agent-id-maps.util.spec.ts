import { computeFlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/utils/compute-flat-role-target-by-agent-id-maps.util';

describe('computeFlatRoleTargetByAgentIdMaps', () => {
  it('indexes agent role targets by agent id', () => {
    const agentRoleTarget = {
      agentId: 'agent-1',
      roleId: 'agent-role',
      universalIdentifier: 'agent-target',
    };

    expect(
      computeFlatRoleTargetByAgentIdMaps({
        flatRoleTargetMaps: {
          byUniversalIdentifier: {
            'agent-target': agentRoleTarget,
            'member-target': {
              agentId: null,
              roleId: 'member-role',
              universalIdentifier: 'member-target',
            },
            'missing-target': undefined,
          },
        },
      }),
    ).toEqual({ 'agent-1': agentRoleTarget });
  });

  it('keeps the same role target reference as the source flat map', () => {
    const agentRoleTarget = { agentId: 'agent-1' };

    const flatRoleTargetByAgentIdMaps = computeFlatRoleTargetByAgentIdMaps({
      flatRoleTargetMaps: {
        byUniversalIdentifier: { 'agent-target': agentRoleTarget },
      },
    });

    expect(flatRoleTargetByAgentIdMaps['agent-1']).toBe(agentRoleTarget);
  });
});
