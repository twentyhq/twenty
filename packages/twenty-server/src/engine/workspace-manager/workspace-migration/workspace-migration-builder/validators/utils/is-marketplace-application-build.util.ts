import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const isMarketplaceApplicationBuild = ({
  isSystemBuild,
  isMarketplaceApplication = false,
}: Pick<
  WorkspaceMigrationValidationBuildOptions,
  'isSystemBuild' | 'isMarketplaceApplication'
>): boolean => !isSystemBuild && isMarketplaceApplication;
