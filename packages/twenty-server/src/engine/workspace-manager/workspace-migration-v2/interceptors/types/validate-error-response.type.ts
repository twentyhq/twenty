import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type ValidationErrorResponse = {
  summary: {
    totalErrors: number;
  } & {
    [P in AllMetadataName as `invalid${Capitalize<P>}`]: number;
  };
  errors: {
    [P in AllMetadataName]: FailedFlatEntityValidation<
      Record<string, unknown>
    >[];
  };
};
