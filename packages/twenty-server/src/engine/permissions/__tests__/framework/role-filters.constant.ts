import { type PrincipalSlot } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ROLE_ID,
  CATEGORY_FIELD_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  REGION_FIELD_ID,
  STATUS_FIELD_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

export type RoleFilter = {
  principalSlot: PrincipalSlot;
  roleId: string;
  fieldMetadataId: string;
  fieldName: string;
  matchingValue: string;
  outsideValue: string;
};

export const ROLE_FILTERS: RoleFilter[] = [
  {
    principalSlot: 'mainPrincipal',
    roleId: MAIN_ROLE_ID,
    fieldMetadataId: STATUS_FIELD_ID,
    fieldName: 'status',
    matchingValue: 'active',
    outsideValue: 'archived',
  },
  {
    principalSlot: 'limitingPrincipal',
    roleId: LIMITING_ROLE_ID,
    fieldMetadataId: CATEGORY_FIELD_ID,
    fieldName: 'category',
    matchingValue: 'core',
    outsideValue: 'other',
  },
  {
    principalSlot: 'applicationPrincipal',
    roleId: APPLICATION_ROLE_ID,
    fieldMetadataId: REGION_FIELD_ID,
    fieldName: 'region',
    matchingValue: 'europe',
    outsideValue: 'americas',
  },
];
