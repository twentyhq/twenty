import { type Manifest } from 'twenty-shared/application';
import { TEST_APPLICATION_PACKAGE_JSON_CHECKSUM } from 'test/integration/metadata/suites/application/constants/test-application-package-json.constant';

export const buildBaseManifest = ({
  appId,
  roleId,
  overrides,
}: {
  appId: string;
  roleId: string;
  overrides?: Partial<Manifest>;
}): Manifest => ({
  application: {
    universalIdentifier: appId,
    defaultRoleUniversalIdentifier: roleId,
    displayName: 'Test Application',
    description: 'Test application',
    applicationVariables: {},
    packageJsonChecksum: TEST_APPLICATION_PACKAGE_JSON_CHECKSUM,
    yarnLockChecksum: null,
  },
  roles: [
    {
      universalIdentifier: roleId,
      label: 'Test Role',
      description: 'A test role',
    },
  ],
  permissionFlags: [],
  skills: [],
  agents: [],
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  publicAssets: [],
  views: [],
  viewFields: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
  ...overrides,
});
