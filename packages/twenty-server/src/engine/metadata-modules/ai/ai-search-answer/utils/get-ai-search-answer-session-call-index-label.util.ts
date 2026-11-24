// Counting generations by their rank in the session gives the per-session distribution without a per-session attribute
export const getAiSearchAnswerSessionCallIndexLabel = (callIndex: number) =>
  callIndex >= 4 ? '4+' : String(callIndex);
