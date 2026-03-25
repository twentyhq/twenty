import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';

describe('isMicrosoftClientTemporaryError', () => {
  it('should return true when body contains the expected text', () => {
    const error = {
      statusCode: 200,
      code: 'SyntaxError',
      requestId: null,
      date: '2025-05-14T11:43:02.024Z',
      body: 'SyntaxError: Unexpected token < in JSON at position 19341',
      headers: {},
    };

    expect(isMicrosoftClientTemporaryError(error.body)).toBe(true);
  });

  it('should return false when body does not contain it', () => {
    const error = {
      statusCode: 400,
      code: 'AuthError',
      requestId: '123456',
      date: '2025-05-14T11:43:02.024Z',
      body: 'Authentication failed',
      headers: {},
    };

    expect(isMicrosoftClientTemporaryError(error.body)).toBe(false);
  });
});
