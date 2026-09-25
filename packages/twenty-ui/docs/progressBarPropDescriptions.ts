import { type ComponentProps } from 'react';

import { type ProgressBar } from '../src/primitives/feedback/ProgressBar/ProgressBar';

export const PROGRESS_BAR_PROP_DESCRIPTIONS = {
  value:
    'Current progress from 0 to 100. Also supplies the accessible value during a countdown.',
  className: 'CSS class applied to the progress root.',
  barColor: 'CSS color of the filled bar. Defaults to the primary text color.',
  backgroundColor: 'CSS background color of the track.',
  withBorderRadius: 'Rounds the track and indicator corners.',
  ariaLabel: 'Accessible name describing the operation being measured.',
  countdownDurationInMs:
    'Starts a visual animation from full to empty over this duration in milliseconds. Does not update `value`.',
  isCountdownPaused:
    'Pauses the countdown animation without resetting its position.',
  onCountdownComplete: 'Called when the countdown animation ends.',
} satisfies Partial<Record<keyof ComponentProps<typeof ProgressBar>, string>>;
