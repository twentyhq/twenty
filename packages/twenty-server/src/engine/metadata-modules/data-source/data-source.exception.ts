import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum DataSourceExceptionCode {
  DATA_SOURCE_NOT_FOUND = 'DATA_SOURCE_NOT_FOUND',
}

const dataSourceExceptionUserFriendlyMessages: Record<
  DataSourceExceptionCode,
  MessageDescriptor
> = {
  [DataSourceExceptionCode.DATA_SOURCE_NOT_FOUND]: msg`Data source not found.`,
};

export class DataSourceException extends CustomException<DataSourceExceptionCode> {
  constructor(
    message: string,
    code: DataSourceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? dataSourceExceptionUserFriendlyMessages[code],
    });
  }
}
