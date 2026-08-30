import { type DICTATION_MODES } from '../constants/dictation-modes.const';

export type DictationMode =
  (typeof DICTATION_MODES)[keyof typeof DICTATION_MODES];
