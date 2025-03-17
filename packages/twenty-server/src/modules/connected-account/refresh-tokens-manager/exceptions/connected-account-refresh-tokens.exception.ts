import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ConnectedAccountRefreshAccessTokenException extends CustomException {
  constructor(
    message: string,
    code: ConnectedAccountRefreshAccessTokenExceptionCode,
  ) {
    super(message, code);
  }
}
