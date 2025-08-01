import { CustomException } from 'src/utils/custom-exception';

export class IndexMetadataException extends CustomException {
  declare code: IndexMetadataExceptionCode;
  constructor(
    message: string,
    code: IndexMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum IndexMetadataExceptionCode {
  INDEX_CREATION_FAILED = 'INDEX_CREATION_FAILED',
  INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD = 'INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD',
}
