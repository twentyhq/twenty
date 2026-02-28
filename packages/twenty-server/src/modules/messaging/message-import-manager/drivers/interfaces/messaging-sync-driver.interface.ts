export interface MessagingSyncDriver<TInput, TOutput> {
  sync(input: TInput): Promise<TOutput>;
}
