// Validated form answers: text, numbers, dates, choices and record ids.
export type SetuAiTaskAnswerValue = string | number | boolean | null | string[];

// Trusted server state only: no credentials, prompts or raw model items.
// The note id is reserved before the note is written, so a retried step
// finds its own note instead of creating a second one.
export type SetuAiTaskStepCheckpoint = {
  reservedNoteId?: string;
  reservedNoteTargetId?: string;
  answers?: {
    version: number;
    prompt: string;
    values: Record<string, SetuAiTaskAnswerValue>;
  }[];
};
