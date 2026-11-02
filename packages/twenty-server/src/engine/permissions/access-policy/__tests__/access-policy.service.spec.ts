import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { AccessPolicyService } from 'src/engine/permissions/access-policy/access-policy.service';
import { type PermissionsService } from 'src/engine/permissions/permissions.service';

const ROLE_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: true,
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
};

const MEMBER: AuthPrincipalVariant = {
  kind: 'userSession',
  variant: 'standard',
};

const MEMBER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-id' },
} as UserWorkspaceAuthContext;

const buildAccessPolicyService = ({ isGranted = true } = {}) => {
  const permissionsService = {
    hasPermissionFlag: jest.fn().mockResolvedValue(isGranted),
  };

  return {
    accessPolicyService: new AccessPolicyService(
      permissionsService as unknown as PermissionsService,
      {} as FeatureFlagService,
    ),
    permissionsService,
  };
};

const isToolAccessPolicySatisfied = ({
  accessPolicyService,
  authPrincipalVariant = MEMBER,
  isFeatureFlagEnabled = true,
}: {
  accessPolicyService: AccessPolicyService;
  authPrincipalVariant?: AuthPrincipalVariant;
  isFeatureFlagEnabled?: boolean;
}) =>
  accessPolicyService.isToolAccessPolicySatisfied({
    accessPolicy: ROLE_WRITE_ACCESS_POLICY,
    authPrincipalVariant,
    authContext: MEMBER_AUTH_CONTEXT,
    featureFlagsMap: {
      [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: isFeatureFlagEnabled,
    } as FeatureFlagMap,
  });

describe('AccessPolicyService', () => {
  describe('isToolAccessPolicySatisfied', () => {
    it('should accept a principal the policy accepts once its flags are granted', async () => {
      const { accessPolicyService, permissionsService } =
        buildAccessPolicyService();

      expect(await isToolAccessPolicySatisfied({ accessPolicyService })).toBe(
        true,
      );
      expect(permissionsService.hasPermissionFlag).toHaveBeenCalledWith({
        authContext: MEMBER_AUTH_CONTEXT,
        setting: PermissionFlagType.ROLES,
      });
    });

    it.each([
      [
        'a principal the policy refuses',
        { kind: 'application', variant: 'withoutUser', withAgent: false },
      ],
      ['no principal', undefined],
    ] as const)(
      'should refuse %s without checking its flags',
      async (_, authPrincipalVariant) => {
        const { accessPolicyService, permissionsService } =
          buildAccessPolicyService();

        expect(
          await accessPolicyService.isToolAccessPolicySatisfied({
            accessPolicy: ROLE_WRITE_ACCESS_POLICY,
            authPrincipalVariant,
            authContext: MEMBER_AUTH_CONTEXT,
            featureFlagsMap: {} as FeatureFlagMap,
          }),
        ).toBe(false);
        expect(permissionsService.hasPermissionFlag).not.toHaveBeenCalled();
      },
    );

    it('should refuse while a required feature flag is off, without checking permission flags', async () => {
      const { accessPolicyService, permissionsService } =
        buildAccessPolicyService();

      expect(
        await isToolAccessPolicySatisfied({
          accessPolicyService,
          isFeatureFlagEnabled: false,
        }),
      ).toBe(false);
      expect(permissionsService.hasPermissionFlag).not.toHaveBeenCalled();
    });

    it('should refuse a required permission flag that is not granted', async () => {
      const { accessPolicyService } = buildAccessPolicyService({
        isGranted: false,
      });

      expect(await isToolAccessPolicySatisfied({ accessPolicyService })).toBe(
        false,
      );
    });
  });
});
