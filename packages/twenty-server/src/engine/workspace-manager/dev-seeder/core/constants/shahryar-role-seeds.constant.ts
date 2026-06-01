import {
  SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED,
  SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED,
  SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED,
  SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED,
  SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED,
  SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED,
  SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED,
} from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/shahryar-custom-object-seeds.constant';

export const SHAHRYAR_ADMIN_ROLE_SEED = {
  label: 'تەدمین',
  description: 'Shahryar administrator with full operational access',
  icon: 'IconUserCog',
  canUpdateAllSettings: true,
  canAccessAllTools: true,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: true,
} as const;

export const SHAHRYAR_SUPERVISOR_ROLE_SEED = {
  label: 'موشریف',
  description: 'Supervisor role limited to assigned Shahryar operations data',
  icon: 'IconUserPin',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
} as const;

export const SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS = [
  {
    objectName: SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
  {
    objectName: SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
  {
    objectName: SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
  {
    objectName: SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
  {
    objectName: SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
  {
    objectName: SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
  {
    objectName: SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED.nameSingular,
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  },
] as const;

export const SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS = [
  {
    objectName: SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'assignedSupervisor',
  },
  {
    objectName: SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'supervisor',
  },
  {
    objectName: SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'supervisor',
  },
  {
    objectName: SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'collectedBy',
  },
  {
    objectName: SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'supervisor',
  },
  {
    objectName: SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'supervisor',
  },
  {
    objectName: SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED.nameSingular,
    ownerFieldName: 'registeredBy',
  },
] as const;
