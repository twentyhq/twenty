import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { getWorkspaceCustomApplicationUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/overrides/utils/get-workspace-custom-application-universal-identifier-or-throw.util';

const CUSTOM_ID = 'custom-application-id';
const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';

const flatApplicationMaps = {
  byId: { [CUSTOM_ID]: { id: CUSTOM_ID, universalIdentifier: CUSTOM } },
};

describe('getWorkspaceCustomApplicationUniversalIdentifierOrThrow', () => {
  it('returns the universal identifier of the workspace custom application', () => {
    expect(
      getWorkspaceCustomApplicationUniversalIdentifierOrThrow({
        workspaceCustomApplicationId: CUSTOM_ID,
        flatApplicationMaps,
      }),
    ).toBe(CUSTOM);
  });

  it('throws when the application is missing from the cache', () => {
    expect(() =>
      getWorkspaceCustomApplicationUniversalIdentifierOrThrow({
        workspaceCustomApplicationId: 'missing',
        flatApplicationMaps,
      }),
    ).toThrow(ApplicationException);
  });
});
