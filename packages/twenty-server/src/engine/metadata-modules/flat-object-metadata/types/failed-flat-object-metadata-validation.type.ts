import { FlatObjectMetadataIdAndNames } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-id-and-names.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

  export type FailedFlatObjectMetadataValidation = {
    error: ObjectMetadataExceptionCode;
    message: string;
    userFriendlyMessage?: string;
    value?: any; // TODO use generic
  } & Partial<FlatObjectMetadataIdAndNames>;
  