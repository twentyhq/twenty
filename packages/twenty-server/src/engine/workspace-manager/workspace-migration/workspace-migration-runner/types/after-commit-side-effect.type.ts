export type AfterCommitSideEffect = {
  description: string;
  run: () => Promise<void>;
};
