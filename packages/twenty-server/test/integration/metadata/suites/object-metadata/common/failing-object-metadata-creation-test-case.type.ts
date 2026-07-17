import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export type FailingObjectMetadataCreationTestCase = {
  input: Partial<Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>>;
  expected:
    | {
        errorCode: 'BAD_USER_INPUT';
        messageContains: string;
      }
    | {
        errorCode: 'METADATA_VALIDATION_FAILED';
        objectValidationMessages: string[];
      };
};
