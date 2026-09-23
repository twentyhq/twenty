import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

// matches only the id prefix of [[skill:<uuid>:<label>]] so brackets in a label cannot break it
const SKILL_REFERENCE_REGEX =
  /\[\[skill:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):/g;

export type ReferencedSkillSourceMessage = Pick<
  ExtendedUIMessage,
  'role' | 'parts'
>;

export const collectReferencedSkillIds = (
  messages: ReferencedSkillSourceMessage[],
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
        assertIsDefinedOrThrow(match[1]);

        skillIds.add(match[1]);
      }
    }
  }

  return [...skillIds];
};
