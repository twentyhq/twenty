import { getTerminalSendButtonHintPosition } from './terminal-send-button-hint-position';

describe('getTerminalSendButtonHintPosition', () => {
  it('should overlap the send button bottom-right corner', () => {
    expect(
      getTerminalSendButtonHintPosition({ bottom: 100, right: 200 }),
    ).toEqual({
      left: 178,
      top: 82,
    });
  });
});
