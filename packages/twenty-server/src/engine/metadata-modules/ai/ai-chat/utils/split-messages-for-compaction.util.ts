import { type ExtendedUIMessage } from 'twenty-shared/ai';

// Recent turns stay verbatim so the model keeps full fidelity on what the
// user just asked; only older turns get folded into the summary.
export const COMPACTION_KEPT_USER_TURNS = 2;

export type CompactionSplit = {
  messagesToCompact: ExtendedUIMessage[];
  messagesToKeep: ExtendedUIMessage[];
};

export const splitMessagesForCompaction = (
  messages: ExtendedUIMessage[],
): CompactionSplit => {
  const userMessageIndexes = messages.reduce<number[]>(
    (indexes, message, index) => {
      if (message.role === 'user') {
        indexes.push(index);
      }

      return indexes;
    },
    [],
  );

  if (userMessageIndexes.length <= COMPACTION_KEPT_USER_TURNS) {
    return { messagesToCompact: [], messagesToKeep: messages };
  }

  const splitIndex =
    userMessageIndexes[userMessageIndexes.length - COMPACTION_KEPT_USER_TURNS];

  return {
    messagesToCompact: messages.slice(0, splitIndex),
    messagesToKeep: messages.slice(splitIndex),
  };
};
