import { Injectable } from '@nestjs/common';

import { type Request } from 'express';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
      isFeatureFlagEnabled: (featureFlag) =>
        isDefined(workspace) &&
        this.featureFlagService.isFeatureEnabled(featureFlag, workspace.id),
      isPermissionFlagGranted: (permissionFlag) =>
        this.isSettingsPermissionGranted({ request, permissionFlag }),
    });
  }

  // grantedByPermissionFlag lets a caller checking many policies resolve each flag once
  async findCallerRefusal({
    accessPolicy,
    authPrincipalVariant,
    authContext,
    featureFlagsMap,
    grantedByPermissionFlag = new Map(),
  }: {
    accessPolicy: AccessPolicy;
    authPrincipalVariant: AuthPrincipalVariant | undefined;
    authContext: WorkspaceAuthContext | undefined;
    featureFlagsMap: FeatureFlagMap;
    grantedByPermissionFlag?: Map<PermissionFlagType, Promise<boolean>>;
  }): Promise<AccessPolicyRefusal | undefined> {
    return this.findRefusal({
      accessPolicy,
      authPrincipalVariant,
      isFeatureFlagEnabled: (featureFlag) =>
        featureFlagsMap[featureFlag] === true,
      isPermissionFlagGranted: (permissionFlag) => {
        const cachedGrant = grantedByPermissionFlag.get(permissionFlag);

        if (isDefined(cachedGrant)) {
          return cachedGrant;
        }

        const grant = this.permissionsService.hasPermissionFlag({
          authContext,
          setting: permissionFlag,
        });

        grantedByPermissionFlag.set(permissionFlag, grant);

        return grant;
      },
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
    isFeatureFlagEnabled,
    isPermissionFlagGranted,
  }: {
    accessPolicy: AccessPolicy;
    authPrincipalVariant: AuthPrincipalVariant | undefined;
    isFeatureFlagEnabled: (
      featureFlag: FeatureFlagKey,
    ) => boolean | Promise<boolean>;
    isPermissionFlagGranted: (
      permissionFlag: PermissionFlagType,
    ) => Promise<boolean>;
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
      if (!(await isFeatureFlagEnabled(featureFlag))) {
        return { reason: 'featureFlag', featureFlag };
      }
    }

    const grants = await Promise.all(
      requiredPermissionFlags.map((permissionFlag) =>
        isPermissionFlagGranted(permissionFlag),
      ),
    );
    const refusedPermissionFlag = requiredPermissionFlags.find(
      (_, index) => !grants[index],
    );

    return isDefined(refusedPermissionFlag)
      ? { reason: 'permissionFlag', permissionFlag: refusedPermissionFlag }
      : undefined;
  }
}
