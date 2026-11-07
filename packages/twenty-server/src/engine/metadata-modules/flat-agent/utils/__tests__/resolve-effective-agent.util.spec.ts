import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

const agentRow = {
  id: '00000000-0000-4000-8000-000000000003',
  name: 'researcher',
  label: 'Researcher',
  prompt: 'Research the company',
  isActive: true,
  triggers: [],
};

describe('resolveEffectiveAgent', () => {
  it('applies workspace overrides to a repository row', () => {
    expect(
      resolveEffectiveAgent({
        ...agentRow,
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            prompt: 'Research the market',
            isActive: false,
          },
        },
      }),
    ).toMatchObject({
      name: 'researcher',
      label: 'Researcher',
      prompt: 'Research the market',
      isActive: false,
    });
  });

  it('returns the agent unchanged without overrides', () => {
    const agent = { ...agentRow, overrides: null };

    expect(resolveEffectiveAgent(agent)).toEqual(agent);
  });

  it('treats a row read before the isActive column existed as active', () => {
    const { isActive: _isActive, ...rowWithoutIsActive } = agentRow;

    expect(
      resolveEffectiveAgent({ ...rowWithoutIsActive, overrides: null }),
    ).toMatchObject({ isActive: true });
  });
});
