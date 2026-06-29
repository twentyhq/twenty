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
  icon: string | null;
  permissionType: PermissionFlagPermissionType;
};

type StandardPermissionFlagMetadata = Pick<
  StandardPermissionFlagDefinition,
  'label' | 'description' | 'icon'
>;

const STANDARD_PERMISSION_FLAG_METADATA: Record<
  PermissionFlagType,
  StandardPermissionFlagMetadata
> = {
  [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: {
    label: 'API Keys & Webhooks',
    description: 'Manage API keys and webhooks',
    icon: 'IconCode',
  },
  [PermissionFlagType.WORKSPACE]: {
    label: 'Workspace',
    description: 'Set global workspace preferences',
    icon: 'IconSettings',
  },
  [PermissionFlagType.WORKSPACE_MEMBERS]: {
    label: 'Users',
    description: 'Add or remove users',
    icon: 'IconUsers',
  },
  [PermissionFlagType.ROLES]: {
    label: 'Roles',
    description: 'Define user roles and access levels',
    icon: 'IconLockOpen',
  },
  [PermissionFlagType.DATA_MODEL]: {
    label: 'Data Model',
    description: 'Edit data structure and fields',
    icon: 'IconHierarchy',
  },
  [PermissionFlagType.SECURITY]: {
    label: 'Security',
    description: 'Manage security policies',
    icon: 'IconKey',
  },
  [PermissionFlagType.WORKFLOWS]: {
    label: 'Workflows',
    description: 'Manage workflows',
    icon: 'IconSettingsAutomation',
  },
  [PermissionFlagType.IMPERSONATE]: {
    label: 'Impersonate',
    description: 'Impersonate workspace users',
    icon: 'IconSpy',
  },
  [PermissionFlagType.SSO_BYPASS]: {
    label: 'SSO Bypass',
    description: 'Enable bypass options',
    icon: 'IconShield',
  },
  [PermissionFlagType.APPLICATIONS]: {
    label: 'Applications',
    description: 'Install and manage applications',
    icon: 'IconApps',
  },
  [PermissionFlagType.MARKETPLACE_APPS]: {
    label: 'Marketplace Apps',
    description: 'Browse and install marketplace apps',
    icon: 'IconShoppingBag',
  },
  [PermissionFlagType.LAYOUTS]: {
    label: 'Layouts',
    description: 'Customize page layouts and UI structure',
    icon: 'IconLayoutSidebarRightCollapse',
  },
  [PermissionFlagType.BILLING]: {
    label: 'Billing',
    description: 'Manage billing and subscriptions',
    icon: 'IconCreditCard',
  },
  [PermissionFlagType.AI_SETTINGS]: {
    label: 'AI',
    description: 'Create and configure AI agents',
    icon: 'IconSparkles',
  },
  [PermissionFlagType.AI]: {
    label: 'Ask AI',
    description: 'Chat with AI agents and use AI features',
    icon: 'IconSparkles',
  },
  [PermissionFlagType.VIEWS]: {
    label: 'Manage Views',
    description: 'Create, edit, and delete workspace views',
    icon: 'IconTable',
  },
  [PermissionFlagType.UPLOAD_FILE]: {
    label: 'Upload Files',
    description: 'Allow uploading files and attachments',
    icon: 'IconFileUpload',
  },
  [PermissionFlagType.DOWNLOAD_FILE]: {
    label: 'Download Files',
    description: 'Allow downloading files and attachments',
    icon: 'IconDownload',
  },
  [PermissionFlagType.SEND_EMAIL_TOOL]: {
    label: 'Send Email',
    description: 'Send emails via connected accounts',
    icon: 'IconMail',
  },
  [PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL]: {
    label: 'Create Calendar Event',
    description: 'Create calendar events via connected accounts',
    icon: 'IconCalendarEvent',
  },
  [PermissionFlagType.HTTP_REQUEST_TOOL]: {
    label: 'HTTP Request',
    description: 'Make HTTP requests to external APIs',
    icon: 'IconApi',
  },
  [PermissionFlagType.CODE_INTERPRETER_TOOL]: {
    label: 'Code Interpreter',
    description: 'Run code to analyze files and data',
    icon: 'IconCode',
  },
  [PermissionFlagType.IMPORT_CSV]: {
    label: 'Import CSV',
    description: 'Allow importing data from CSV files',
    icon: 'IconFileImport',
  },
  [PermissionFlagType.EXPORT_CSV]: {
    label: 'Export CSV',
    description: 'Allow exporting data to CSV files',
    icon: 'IconFileExport',
  },
  [PermissionFlagType.CONNECTED_ACCOUNTS]: {
    label: 'Sync Account',
    description: 'Sync email and calendar accounts',
    icon: 'IconAt',
  },
  [PermissionFlagType.PROFILE_INFORMATION]: {
    label: 'Edit Profile',
    description: 'Edit own profile information',
    icon: 'IconUser',
  },
};

export const STANDARD_PERMISSION_FLAG_DEFINITIONS: StandardPermissionFlagDefinition[] =
  Object.values(PermissionFlagType).map((key) => ({
    key,
    universalIdentifier: SystemPermissionFlag[key],
    ...STANDARD_PERMISSION_FLAG_METADATA[key],
    permissionType: TOOL_PERMISSION_FLAGS.includes(key) ? 'tool' : 'settings',
  }));
