import { AllMetadataName } from "twenty-shared/metadata";

export type InferDeletionFromMissingEntities =
  | true
  | Partial<Record<AllMetadataName, boolean>>
  | undefined;
