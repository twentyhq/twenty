import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

describe('mimeEncode', () => {
  it('should encode properly', () => {
    expect(mimeEncode('test-accents-é-è-ê-ë')).toBe(
      '=?UTF-8?B?dGVzdC1hY2NlbnRzLcOpLcOoLcOqLcOr?=',
    );
  });
});
