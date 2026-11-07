import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';

import { isDashboardInstalledByThirdPartyApplication } from 'src/engine/metadata-modules/page-layout/utils/is-dashboard-installed-by-third-party-application.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c01';
const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c02';

describe('isDashboardInstalledByThirdPartyApplication', () => {
  it.each([
    [
      'a dashboard an application installed',
      PageLayoutType.DASHBOARD,
      INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
      true,
    ],
    [
      'a workspace dashboard',
      PageLayoutType.DASHBOARD,
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      false,
    ],
    [
      'a twenty-standard dashboard',
      PageLayoutType.DASHBOARD,
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      false,
    ],
    [
      'a record page an application installed',
      PageLayoutType.RECORD_PAGE,
      INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
      false,
    ],
  ])(
    'should tell %s apart',
    (_title, type, applicationUniversalIdentifier, expected) => {
      expect(
        isDashboardInstalledByThirdPartyApplication({
          pageLayout: { type, applicationUniversalIdentifier },
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).toBe(expected);
    },
  );
});
