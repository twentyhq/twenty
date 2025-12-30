import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum DataSourceExceptionCode {
  DATA_SOURCE_NOT_FOUND = 'DATA_SOURCE_NOT_FOUND',
}

const getDataSourceExceptionUserFriendlyMessage = (
  code: DataSourceExceptionCode,
) => {
  switch (code) {
    case DataSourceExceptionCode.DATA_SOURCE_NOT_FOUND:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class DataSourceException extends CustomException<DataSourceExceptionCode> {
  constructor(
    message: string,
    code: DataSourceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getDataSourceExceptionUserFriendlyMessage(code),
    });
  }
}
