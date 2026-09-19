export type AfterCommitSideEffect = {
  description: string;
  deduplicationKey?: string;
  run: () => Promise<void>;
};
