import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type PermissionFlagPermissionType } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { TOOL_PERMISSION_FLAGS } from 'src/engine/metadata-modules/permissions/constants/tool-permission-flags';

export type StandardPermissionFlagDefinition = {
  key: PermissionFlagType;
  universalIdentifier: string;
  label: string;
  description: string | null;
  iconKey: string | null;
  permissionType: PermissionFlagPermissionType;
};

type StandardPermissionFlagMetadata = Pick<
  StandardPermissionFlagDefinition,
  'label' | 'description' | 'iconKey'
>;

const STANDARD_PERMISSION_FLAG_METADATA: Record<
  PermissionFlagType,
  StandardPermissionFlagMetadata
> = {
  [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: {
    label: 'API Keys & Webhooks',
    description: 'Manage API keys and webhooks',
    iconKey: 'IconCode',
  },
  [PermissionFlagType.WORKSPACE]: {
    label: 'Workspace',
    description: 'Set global workspace preferences',
    iconKey: 'IconSettings',
  },
  [PermissionFlagType.WORKSPACE_MEMBERS]: {
    label: 'Users',
    description: 'Add or remove users',
    iconKey: 'IconUsers',
  },
  [PermissionFlagType.ROLES]: {
    label: 'Roles',
    description: 'Define user roles and access levels',
    iconKey: 'IconLockOpen',
  },
  [PermissionFlagType.DATA_MODEL]: {
    label: 'Data Model',
    description: 'Edit data structure and fields',
    iconKey: 'IconHierarchy',
  },
  [PermissionFlagType.SECURITY]: {
    label: 'Security',
    description: 'Manage security policies',
    iconKey: 'IconKey',
  },
  [PermissionFlagType.WORKFLOWS]: {
    label: 'Workflows',
    description: 'Manage workflows',
    iconKey: 'IconSettingsAutomation',
  },
  [PermissionFlagType.IMPERSONATE]: {
    label: 'Impersonate',
    description: 'Impersonate workspace users',
    iconKey: 'IconSpy',
  },
  [PermissionFlagType.SSO_BYPASS]: {
    label: 'SSO Bypass',
    description: 'Enable bypass options',
    iconKey: 'IconShield',
  },
  [PermissionFlagType.APPLICATIONS]: {
    label: 'Applications',
    description: 'Install and manage applications',
    iconKey: 'IconApps',
  },
  [PermissionFlagType.MARKETPLACE_APPS]: {
    label: 'Marketplace Apps',
    description: 'Browse and install marketplace apps',
    iconKey: 'IconShoppingBag',
  },
  [PermissionFlagType.LAYOUTS]: {
    label: 'Layouts',
    description: 'Customize page layouts and UI structure',
    iconKey: 'IconLayoutSidebarRightCollapse',
  },
  [PermissionFlagType.BILLING]: {
    label: 'Billing',
    description: 'Manage billing and subscriptions',
    iconKey: 'IconCreditCard',
  },
  [PermissionFlagType.AI_SETTINGS]: {
    label: 'AI',
    description: 'Create and configure AI agents',
    iconKey: 'IconSparkles',
  },
  [PermissionFlagType.AI]: {
    label: 'Ask AI',
    description: 'Chat with AI agents and use AI features',
    iconKey: 'IconSparkles',
  },
  [PermissionFlagType.VIEWS]: {
    label: 'Manage Views',
    description: 'Create, edit, and delete workspace views',
    iconKey: 'IconTable',
  },
  [PermissionFlagType.UPLOAD_FILE]: {
    label: 'Upload Files',
    description: 'Allow uploading files and attachments',
    iconKey: 'IconFileUpload',
  },
  [PermissionFlagType.DOWNLOAD_FILE]: {
    label: 'Download Files',
    description: 'Allow downloading files and attachments',
    iconKey: 'IconDownload',
  },
  [PermissionFlagType.SEND_EMAIL_TOOL]: {
    label: 'Send Email',
    description: 'Send emails via connected accounts',
    iconKey: 'IconMail',
  },
  [PermissionFlagType.HTTP_REQUEST_TOOL]: {
    label: 'HTTP Request',
    description: 'Make HTTP requests to external APIs',
    iconKey: 'IconApi',
  },
  [PermissionFlagType.CODE_INTERPRETER_TOOL]: {
    label: 'Code Interpreter',
    description: 'Run code to analyze files and data',
    iconKey: 'IconCode',
  },
  [PermissionFlagType.IMPORT_CSV]: {
    label: 'Import CSV',
    description: 'Allow importing data from CSV files',
    iconKey: 'IconFileImport',
  },
  [PermissionFlagType.EXPORT_CSV]: {
    label: 'Export CSV',
    description: 'Allow exporting data to CSV files',
    iconKey: 'IconFileExport',
  },
  [PermissionFlagType.CONNECTED_ACCOUNTS]: {
    label: 'Sync Account',
    description: 'Sync email and calendar accounts',
    iconKey: 'IconAt',
  },
  [PermissionFlagType.PROFILE_INFORMATION]: {
    label: 'Edit Profile',
    description: 'Edit own profile information',
    iconKey: 'IconUser',
  },
};

export const STANDARD_PERMISSION_FLAG_DEFINITIONS: StandardPermissionFlagDefinition[] =
  Object.values(PermissionFlagType).map((key) => ({
    key,
    universalIdentifier: SystemPermissionFlag[key],
    ...STANDARD_PERMISSION_FLAG_METADATA[key],
    permissionType: TOOL_PERMISSION_FLAGS.includes(key) ? 'tool' : 'settings',
  }));
