import { DataSourceExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class DataSourceException extends CustomException {
  constructor(message: string, code: DataSourceExceptionCode) {
    super(message, code);
  }
}
