import { nullifyEmptyActorDefaultValue } from '../nullify-empty-actor-default-value.util';

describe('nullifyEmptyActorDefaultValue', () => {
  it('returns null when all sub-fields are null or empty-string equivalents', () => {
    expect(
      nullifyEmptyActorDefaultValue({
        source: null,
        workspaceMemberId: null,
        name: "''",
        context: null,
      }),
    ).toBeNull();
  });

  it('returns normalized object when source has a value', () => {
    expect(
      nullifyEmptyActorDefaultValue({
        source: 'MANUAL',
        workspaceMemberId: null,
        name: "''",
        context: null,
      }),
    ).toEqual({
      source: 'MANUAL',
      workspaceMemberId: null,
      name: null,
      context: null,
    });
  });
});
