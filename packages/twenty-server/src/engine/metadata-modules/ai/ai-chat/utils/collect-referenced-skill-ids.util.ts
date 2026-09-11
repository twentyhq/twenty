import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// Matches the [[skill:<uuid>:<label>]] references the composer inserts when a
// user picks a skill from the / menu.
const SKILL_REFERENCE_REGEX =
  /\[\[skill:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):[^\[\]\n]*\]\]/g;

export const collectReferencedSkillIds = (
  messages: ExtendedUIMessage[],
): string[] => {
  const skillIds = new Set<string>();

  for (const message of messages) {
    if (message.role !== 'user' || !isDefined(message.parts)) {
      continue;
    }

    for (const part of message.parts) {
      if (part.type !== 'text') {
        continue;
      }

      for (const match of part.text.matchAll(SKILL_REFERENCE_REGEX)) {
        skillIds.add(match[1]);
      }
    }
  }

  return [...skillIds];
};
