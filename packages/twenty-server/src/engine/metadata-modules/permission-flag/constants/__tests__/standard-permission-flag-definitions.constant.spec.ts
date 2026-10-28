import { STANDARD_PERMISSION_FLAG_DEFINITIONS } from 'src/engine/metadata-modules/permission-flag/constants/standard-permission-flag-definitions.constant';

// Existing workspaces get a new standard flag only from an upgrade command: ship one, then add the key here
const STANDARD_PERMISSION_FLAG_KEYS_BACKFILLED_IN_EXISTING_WORKSPACES = [
  'API_KEYS_AND_WEBHOOKS',
  'WORKSPACE',
  'WORKSPACE_MEMBERS',
  'ROLES',
  'DATA_MODEL',
  'SECURITY',
  'WORKFLOWS',
  'IMPERSONATE',
  'SSO_BYPASS',
  'APPLICATIONS',
  'MARKETPLACE_APPS',
  'LAYOUTS',
  'BILLING',
  'AI_SETTINGS',
  'AI',
  'VIEWS',
  'UPLOAD_FILE',
  'DOWNLOAD_FILE',
  'SEND_EMAIL_TOOL',
  'CREATE_CALENDAR_EVENT_TOOL',
  'HTTP_REQUEST_TOOL',
  'CODE_INTERPRETER_TOOL',
  'IMPORT_CSV',
  'EXPORT_CSV',
  'CONNECTED_ACCOUNTS',
  'PROFILE_INFORMATION',
];

describe('STANDARD_PERMISSION_FLAG_DEFINITIONS', () => {
  it('only holds flags an upgrade command creates in existing workspaces', () => {
    expect(
      STANDARD_PERMISSION_FLAG_DEFINITIONS.map(
        (standardPermissionFlagDefinition) =>
          standardPermissionFlagDefinition.key,
      ).sort(),
    ).toEqual(
      [
        ...STANDARD_PERMISSION_FLAG_KEYS_BACKFILLED_IN_EXISTING_WORKSPACES,
      ].sort(),
    );
  });
});
