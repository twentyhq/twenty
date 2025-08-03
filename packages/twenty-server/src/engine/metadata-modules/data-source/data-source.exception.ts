import { CustomException } from 'src/utils/custom-exception';

export class DataSourceException extends CustomException<DataSourceExceptionCode> {}

export enum DataSourceExceptionCode {
  DATA_SOURCE_NOT_FOUND = 'DATA_SOURCE_NOT_FOUND',
}
