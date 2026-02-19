import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const isCallerTwentyStandardApp = (
  buildOptions: WorkspaceMigrationBuilderOptions,
) =>
  buildOptions.applicationUniversalIdentifier ===
  TWENTY_STANDARD_APPLICATION.universalIdentifier;
