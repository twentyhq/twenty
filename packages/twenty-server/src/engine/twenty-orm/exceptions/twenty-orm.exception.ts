import { CustomException } from 'src/utils/custom-exception';

export class TwentyORMException extends CustomException {
  code: TwentyORMExceptionCode;
  constructor(message: string, code: TwentyORMExceptionCode) {
    super(message, code);
  }
}

export enum TwentyORMExceptionCode {
  METADATA_VERSION_NOT_FOUND = 'METADATA_VERSION_NOT_FOUND',
  METADATA_VERSION_MISMATCH = 'METADATA_VERSION_MISMATCH',
  METADATA_COLLECTION_NOT_FOUND = 'METADATA_COLLECTION_NOT_FOUND',
  WORKSPACE_SCHEMA_NOT_FOUND = 'WORKSPACE_SCHEMA_NOT_FOUND',
}
