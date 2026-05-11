import { getTerminalSendButtonHintPosition } from '../utils/terminal-send-button-hint-position';

describe('getTerminalSendButtonHintPosition', () => {
  it('anchors the finger hint near the send button bottom-right corner', () => {
    expect(
      getTerminalSendButtonHintPosition({
        bottom: 120,
        right: 240,
      }),
    ).toEqual({
      left: 218,
      top: 102,
    });
  });
});
