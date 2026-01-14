import { type AllMetadataName } from '@/metadata/all-metadata-name.type';

export type FailedMetadataValidationError = {
  code: string;
  message: string;
  userFriendlyMessage?: string;
  value?: unknown;
};

export type FailedMetadataValidation = {
  type: string;
  errors: FailedMetadataValidationError[];
  flatEntityMinimalInformation: Record<string, unknown>;
};

export type MetadataValidationErrorResponse = {
  summary: {
    totalErrors: number;
  } & {
    [P in AllMetadataName as P]?: number;
  };
  errors: {
    [P in AllMetadataName]?: FailedMetadataValidation[];
  };
};

export enum WorkspaceMigrationV2ExceptionCode {
  BUILDER_INTERNAL_SERVER_ERROR = 'BUILDER_INTERNAL_SERVER_ERROR',
  RUNNER_INTERNAL_SERVER_ERROR = 'RUNNER_INTERNAL_SERVER_ERROR',
}
