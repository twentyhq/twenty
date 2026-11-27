import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { getMarketplaceApplicationRoleAssignabilityErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-marketplace-application-role-assignability-errors.util';

const buildOptionsFor = ({
  isMarketplaceApplication,
  isSystemBuild = false,
}: Partial<
  Pick<
    WorkspaceMigrationValidationBuildOptions,
    'isSystemBuild' | 'isMarketplaceApplication'
  >
>) => ({ isSystemBuild, isMarketplaceApplication });

const MARKETPLACE_BUILD = buildOptionsFor({ isMarketplaceApplication: true });

const UNRESTRICTED_BUILDS = [
  { title: 'a build that is not a marketplace app sync', options: {} },
  {
    title: 'a non-marketplace app sync',
    options: { isMarketplaceApplication: false },
  },
  {
    title: 'a system build',
    options: { isMarketplaceApplication: true, isSystemBuild: true },
  },
];

describe('getMarketplaceApplicationRoleAssignabilityErrors', () => {
  it('accepts an agent-only role of a marketplace application', () => {
    expect(
      getMarketplaceApplicationRoleAssignabilityErrors({
        flatRole: {
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
        },
        buildOptions: MARKETPLACE_BUILD,
      }),
    ).toEqual([]);
  });

  it.each([
    { canBeAssignedToUsers: true, canBeAssignedToApiKeys: false },
    { canBeAssignedToUsers: false, canBeAssignedToApiKeys: true },
  ])(
    'refuses a marketplace application role assignable to users or API keys %o',
    (flatRole) => {
      expect(
        getMarketplaceApplicationRoleAssignabilityErrors({
          flatRole,
          buildOptions: MARKETPLACE_BUILD,
        }),
      ).toEqual([
        expect.objectContaining({
          code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_ASSIGNABILITY,
        }),
      ]);
    },
  );

  it.each(UNRESTRICTED_BUILDS)(
    'accepts a role assignable to users for $title',
    ({ options }) => {
      expect(
        getMarketplaceApplicationRoleAssignabilityErrors({
          flatRole: {
            canBeAssignedToUsers: true,
            canBeAssignedToApiKeys: true,
          },
          buildOptions: buildOptionsFor(options),
        }),
      ).toEqual([]);
    },
  );
});

describe('getMarketplaceApplicationRoleAssignabilityErrors on update', () => {
  const ASSIGNABLE_EVERYWHERE = {
    canBeAssignedToUsers: true,
    canBeAssignedToApiKeys: true,
  };

  it.each([
    {
      title: 'keeps both flags on',
      flatRole: ASSIGNABLE_EVERYWHERE,
    },
    {
      title: 'turns one flag off',
      flatRole: { canBeAssignedToUsers: true, canBeAssignedToApiKeys: false },
    },
    {
      title: 'turns both flags off',
      flatRole: { canBeAssignedToUsers: false, canBeAssignedToApiKeys: false },
    },
  ])('accepts an installed role update that $title', ({ flatRole }) => {
    expect(
      getMarketplaceApplicationRoleAssignabilityErrors({
        flatRole,
        fromFlatRole: ASSIGNABLE_EVERYWHERE,
        buildOptions: MARKETPLACE_BUILD,
      }),
    ).toEqual([]);
  });

  it('refuses an update that turns a flag back on', () => {
    expect(
      getMarketplaceApplicationRoleAssignabilityErrors({
        flatRole: ASSIGNABLE_EVERYWHERE,
        fromFlatRole: {
          canBeAssignedToUsers: true,
          canBeAssignedToApiKeys: false,
        },
        buildOptions: MARKETPLACE_BUILD,
      }),
    ).toEqual([
      expect.objectContaining({
        code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_ASSIGNABILITY,
      }),
    ]);
  });
});
