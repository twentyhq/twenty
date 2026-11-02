import { Injectable } from '@nestjs/common';

import { type Request } from 'express';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type AccessPolicyRefusal } from 'src/engine/guards/types/access-policy-refusal.type';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { classifyAuthPrincipal } from 'src/engine/guards/utils/classify-auth-principal.util';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';
import { PermissionsService } from 'src/engine/permissions/permissions.service';

// A workspace being created has no roles to check settings permissions against yet
const WORKSPACE_ACTIVATION_STATUSES_WITHOUT_ROLES = [
  WorkspaceActivationStatus.PENDING_CREATION,
  WorkspaceActivationStatus.ONGOING_CREATION,
];

type SettingsPermissionRequest = Pick<
  Request,
  'workspace' | 'userWorkspaceId' | 'apiKey' | 'application' | 'agentId'
>;

type PermissionFlagGrantee =
  | { type: 'request'; request: SettingsPermissionRequest }
  | {
      type: 'roles';
      authContext: WorkspaceAuthContext | undefined;
    };

@Injectable()
export class AccessPolicyService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async findRequestRefusal({
    accessPolicy,
    request,
  }: {
    accessPolicy: AccessPolicy;
    request: Request;
  }): Promise<AccessPolicyRefusal | undefined> {
    const { workspace } = request;

    return this.findRefusal({
      accessPolicy,
      authPrincipalVariant: classifyAuthPrincipal(request),
      featureFlagsMap: isDefined(workspace)
        ? await this.featureFlagService.getWorkspaceFeatureFlagsMap(
            workspace.id,
          )
        : undefined,
      grantee: { type: 'request', request },
    });
  }

  async findCallerRefusal({
    accessPolicy,
    authPrincipalVariant,
    authContext,
    featureFlagsMap,
  }: {
    accessPolicy: AccessPolicy;
    authPrincipalVariant: AuthPrincipalVariant | undefined;
    authContext: WorkspaceAuthContext | undefined;
    featureFlagsMap: FeatureFlagMap;
  }): Promise<AccessPolicyRefusal | undefined> {
    return this.findRefusal({
      accessPolicy,
      authPrincipalVariant,
      featureFlagsMap,
      grantee: { type: 'roles', authContext },
    });
  }

  async isSettingsPermissionGranted({
    request,
    permissionFlag,
  }: {
    request: SettingsPermissionRequest;
    permissionFlag: PermissionFlagType;
  }): Promise<boolean> {
    const { workspace } = request;

    if (!isDefined(workspace)) {
      return false;
    }

    if (
      WORKSPACE_ACTIVATION_STATUSES_WITHOUT_ROLES.includes(
        workspace.activationStatus,
      )
    ) {
      return true;
    }

    return this.permissionsService.userHasWorkspaceSettingPermission({
      userWorkspaceId: request.userWorkspaceId,
      setting: permissionFlag,
      workspaceId: workspace.id,
      apiKeyId: request.apiKey?.id,
      applicationId: request.application?.id,
      agentId: request.agentId,
    });
  }

  private async findRefusal({
    accessPolicy: {
      authPrincipals,
      requiredPermissionFlags,
      requiredFeatureFlags = [],
    },
    authPrincipalVariant,
    featureFlagsMap,
    grantee,
  }: {
    accessPolicy: AccessPolicy;
    authPrincipalVariant: AuthPrincipalVariant | undefined;
    featureFlagsMap: FeatureFlagMap | undefined;
    grantee: PermissionFlagGrantee;
  }): Promise<AccessPolicyRefusal | undefined> {
    if (
      !isDefined(authPrincipalVariant) ||
      !isAuthPrincipalVariantAccepted({
        authPrincipalGuardConfig: authPrincipals,
        authPrincipalVariant,
      })
    ) {
      return { reason: 'authPrincipal' };
    }

    for (const featureFlag of requiredFeatureFlags) {
      if (featureFlagsMap?.[featureFlag] !== true) {
        return { reason: 'featureFlag', featureFlag };
      }
    }

    for (const permissionFlag of requiredPermissionFlags) {
      if (!(await this.isPermissionFlagGranted({ permissionFlag, grantee }))) {
        return { reason: 'permissionFlag', permissionFlag };
      }
    }

    return undefined;
  }

  private isPermissionFlagGranted({
    permissionFlag,
    grantee,
  }: {
    permissionFlag: PermissionFlagType;
    grantee: PermissionFlagGrantee;
  }): Promise<boolean> {
    switch (grantee.type) {
      case 'request':
        return this.isSettingsPermissionGranted({
          request: grantee.request,
          permissionFlag,
        });
      case 'roles':
        return this.permissionsService.hasPermissionFlag({
          authContext: grantee.authContext,
          setting: permissionFlag,
        });
      default:
        return assertUnreachable(grantee);
    }
  }
}
