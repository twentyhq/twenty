export type WorkflowMcpToolCallResult =
  | { status: 'invalid_arguments'; message: string }
  | { status: 'failed'; error: string }
  | { status: 'succeeded'; result: object };
