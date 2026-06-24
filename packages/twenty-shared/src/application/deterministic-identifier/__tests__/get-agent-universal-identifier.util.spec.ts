import { getAgentUniversalIdentifier } from '@/application/deterministic-identifier/get-agent-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getAgentUniversalIdentifier', () => {
  it('derives a deterministic id from the agent name within its application', () => {
    expect(
      getAgentUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        name: 'My Agent',
      }),
    ).toBe('3d16dbdf-98c9-59c6-b770-81161144fc78');
  });
});
