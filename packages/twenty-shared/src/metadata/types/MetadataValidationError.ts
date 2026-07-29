import { type AllMetadataName } from '@/metadata/types/all-metadata-name.type';

export type FailedMetadataValidationError = {
  code: string;
  message: string;
  userFriendlyMessage?: string;
  value?: unknown;
};

// Cross-reference for "create" actions that collided with an existing entity
// on the server. The server populates this for the universalIdentifier and
// viewField collisions so the CLI can render the existing entity owner and id
// instead of just "already exists".
export type ExistingEntityConflictContext = {
  existingEntityId: string;
  existingApplicationUniversalIdentifier: string;
};

export type FailedMetadataValidation = {
  type: string;
  errors: FailedMetadataValidationError[];
  flatEntityMinimalInformation: Record<string, unknown>;
  existingEntityConflictContext?: ExistingEntityConflictContext | null;
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
