// Types for the `ask_questions` AI chat tool: the assistant pauses the turn to
// ask the user one or more multiple-choice questions, and resumes once answered.
// Shared between the server (tool definition + persistence) and the front
// (interactive question card rendering).

export const ASK_QUESTIONS_TOOL_NAME = 'ask_questions';

export type AskQuestionOption = {
  // Concise text shown on the option row (1-5 words).
  label: string;
  // Longer explanation revealed via the option's info icon.
  description?: string;
  // Renders the "Recommended" badge on this option.
  isRecommended?: boolean;
};

export type AskQuestionItem = {
  // Very short label/tag for the question (≤ ~32 chars).
  header: string;
  // The full question to ask the user.
  question: string;
  // 2-4 mutually exclusive options.
  options: AskQuestionOption[];
  // Allow selecting more than one option.
  allowMultiSelect?: boolean;
};

export type AskQuestionAnswer = {
  questionIndex: number;
  // Indices into the question's `options`. Empty when only free text was given.
  selectedOptionIndices: number[];
  // The "Type anything to do differently." free-form fallback.
  freeText?: string;
};

export type AskQuestionsToolStatus = 'pending' | 'answered' | 'skipped';

// Stored as the tool part's `output.result`, mutated in place across the
// lifecycle: pending (asked) -> answered (resolved) | skipped (dismissed).
export type AskQuestionsToolResult = {
  questions: AskQuestionItem[];
  status: AskQuestionsToolStatus;
  answers?: AskQuestionAnswer[];
};

export type AskQuestionsToolInput = {
  questions: AskQuestionItem[];
};
