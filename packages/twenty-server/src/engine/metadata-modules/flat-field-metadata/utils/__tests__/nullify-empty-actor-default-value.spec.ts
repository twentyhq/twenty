import { nullifyEmptyActorDefaultValue } from '../nullify-empty-actor-default-value.util';

describe('nullifyEmptyActorDefaultValue', () => {
  it('returns null when all sub-fields are null or empty-string equivalents', () => {
    expect(
      nullifyEmptyActorDefaultValue({
        source: null,
        workspaceMemberId: null,
        applicationUniversalIdentifier: null,
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
        applicationUniversalIdentifier: null,
        name: "''",
        context: null,
      }),
    ).toEqual({
      source: 'MANUAL',
      workspaceMemberId: null,
      applicationUniversalIdentifier: null,
      name: null,
      context: null,
    });
  });

  it('retains application universal identifier when it has a value', () => {
    expect(
      nullifyEmptyActorDefaultValue({
        source: null,
        workspaceMemberId: null,
        applicationUniversalIdentifier: '20202020-136c-4d90-954a-fc6a4f186063',
        name: "''",
        context: null,
      }),
    ).toEqual({
      source: null,
      workspaceMemberId: null,
      applicationUniversalIdentifier: '20202020-136c-4d90-954a-fc6a4f186063',
      name: null,
      context: null,
    });
  });
});
