import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { getMarketplaceApplicationRoleRestrictionErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-marketplace-application-role-restriction-errors.util';

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

describe('getMarketplaceApplicationRoleRestrictionErrors', () => {
  it('refuses any row-level rule or field permission on a marketplace application', () => {
    expect(
      getMarketplaceApplicationRoleRestrictionErrors({
        buildOptions: MARKETPLACE_BUILD,
      }),
    ).toEqual([
      expect.objectContaining({
        code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_RESTRICTION,
      }),
    ]);
  });

  it.each(UNRESTRICTED_BUILDS)('accepts them for $title', ({ options }) => {
    expect(
      getMarketplaceApplicationRoleRestrictionErrors({
        buildOptions: buildOptionsFor(options),
      }),
    ).toEqual([]);
  });
});
