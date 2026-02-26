import { type Manifest } from 'twenty-shared/application';

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
    icon: 'IconTestPipe',
    applicationVariables: {},
    packageJsonChecksum: null,
    yarnLockChecksum: null,
    apiClientChecksum: null,
  },
  roles: [
    {
      universalIdentifier: roleId,
      label: 'Test Role',
      description: 'A test role',
    },
  ],
  skills: [],
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
  ...overrides,
});
