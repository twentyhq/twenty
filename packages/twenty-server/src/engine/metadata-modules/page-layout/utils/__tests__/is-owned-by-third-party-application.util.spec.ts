import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { isOwnedByThirdPartyApplication } from 'src/engine/metadata-modules/page-layout/utils/is-owned-by-third-party-application.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c01';
const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c02';

describe('isOwnedByThirdPartyApplication', () => {
  it.each([
    [
      'an installed application',
      INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
      true,
    ],
    ['the workspace', WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER, false],
    [
      'twenty-standard',
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      false,
    ],
  ])(
    'should tell whether an entity owned by %s is owned by a third-party application',
    (_owner, applicationUniversalIdentifier, expected) => {
      expect(
        isOwnedByThirdPartyApplication({
          applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).toBe(expected);
    },
  );
});
