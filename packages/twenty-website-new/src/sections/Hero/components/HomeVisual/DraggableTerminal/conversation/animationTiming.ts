// All chat animation timings live here so the whole sequence can be retuned
// from a single file. Values are in milliseconds.
export const CHAT_TIMINGS = {
  // Beat between the user bubble landing and the assistant starting to think.
  userToAssistantMs: 320,
  // How long the thinking dots bounce before the intro text begins streaming.
  thinkingMs: 700,
  // How long each character takes during text streaming.
  textStreamCharMs: 14,
  // Pause between the intro finishing and the file card appearing.
  textToFileDelayMs: 380,
  // How long the file card stays "in-progress" before flipping to done.
  fileWorkingDelayMs: 900,
  // Entrance animation duration for user / assistant bubbles.
  bubbleEnterMs: 280,
  // Entrance animation duration for the file card.
  fileCardEnterMs: 320,
} as const;
