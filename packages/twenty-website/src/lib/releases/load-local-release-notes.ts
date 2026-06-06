import { GENERATED_RELEASE_NOTES } from './generated-release-notes';
import type { LocalReleaseNote } from './types';

export function loadLocalReleaseNotes(): LocalReleaseNote[] {
  return GENERATED_RELEASE_NOTES;
}
