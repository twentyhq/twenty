import { CustomError } from 'src/utils/custom-error';

export class DataSourceException extends CustomError {
  constructor(message: string, code: DataSourceExceptionCode) {
    super(message, code);
  }
}

export enum DataSourceExceptionCode {
  DATA_SOURCE_NOT_FOUND = 'DATA_SOURCE_NOT_FOUND',
}
