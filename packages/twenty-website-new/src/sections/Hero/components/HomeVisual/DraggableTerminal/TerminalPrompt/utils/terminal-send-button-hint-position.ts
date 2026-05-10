import type { TerminalSendButtonHintPosition } from '../types/terminal-send-button-hint-position-types';

const FINGER_OFFSET_RIGHT = -22;
const FINGER_OFFSET_BOTTOM = -18;

export const getTerminalSendButtonHintPosition = ({
  bottom,
  right,
}: {
  bottom: number;
  right: number;
}): TerminalSendButtonHintPosition => ({
  left: right + FINGER_OFFSET_RIGHT,
  top: bottom + FINGER_OFFSET_BOTTOM,
});
