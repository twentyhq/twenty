import { type RecordReadScope } from 'src/engine/twenty-orm/types/record-read-scope.type';

type RoleId = string;

type RecordReadScopeOption = { readScope?: RecordReadScope };

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | ({ unionOf: RoleId[] } & RecordReadScopeOption)
  | ({ intersectionOf: RoleId[] } & RecordReadScopeOption);
