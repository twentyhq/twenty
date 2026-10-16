import { PermissionFlagType } from 'twenty-shared/constants';

import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

// Agent tokens only reach MCP, so accepting them here leaves GraphQL to its class-level guard
const ALL_WORKSPACE_CALLERS: AuthPrincipalGuardConfig = {
  userSession: {
    standard: true,
    impersonated: true,
    playground: true,
    workspaceAgnostic: false,
  },
  apiKey: true,
  oauthClient: true,
  application: { withUser: true, withoutUser: true, withAgent: true },
};

const ALL_WORKSPACE_CALLERS_EXCEPT_APPLICATIONS: AuthPrincipalGuardConfig = {
  ...ALL_WORKSPACE_CALLERS,
  application: false,
};

export const LOGIC_FUNCTION_OPERATIONS = {
  list: {
    name: 'logicFunction.list',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [],
  },
  findOne: {
    name: 'logicFunction.findOne',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [],
  },
  canRunOnDemand: {
    name: 'logicFunction.canRunOnDemand',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [],
  },
  execute: {
    name: 'logicFunction.execute',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [PermissionFlagType.WORKFLOWS],
  },
  executeAsTool: {
    name: 'logicFunction.executeAsTool',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [],
  },
  readSource: {
    name: 'logicFunction.readSource',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [PermissionFlagType.WORKFLOWS],
  },
  updateSource: {
    name: 'logicFunction.updateSource',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [PermissionFlagType.WORKFLOWS],
  },
  create: {
    name: 'logicFunction.create',
    authPrincipal: ALL_WORKSPACE_CALLERS_EXCEPT_APPLICATIONS,
    permissionFlags: [PermissionFlagType.WORKFLOWS],
  },
  delete: {
    name: 'logicFunction.delete',
    authPrincipal: ALL_WORKSPACE_CALLERS_EXCEPT_APPLICATIONS,
    permissionFlags: [PermissionFlagType.WORKFLOWS],
  },
  getAvailablePackages: {
    name: 'logicFunction.getAvailablePackages',
    authPrincipal: ALL_WORKSPACE_CALLERS,
    permissionFlags: [PermissionFlagType.WORKFLOWS],
  },
} as const satisfies Record<string, OperationPolicy>;
