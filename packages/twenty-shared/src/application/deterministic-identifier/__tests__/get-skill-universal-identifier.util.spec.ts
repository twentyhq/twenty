import { getSkillUniversalIdentifier } from '@/application/deterministic-identifier/get-skill-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getSkillUniversalIdentifier', () => {
  it('derives a deterministic id from the skill name within its application', () => {
    expect(
      getSkillUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'search',
      }),
    ).toBe('91cd3731-e098-5a62-86af-6fe9ac79812b');
  });
});
