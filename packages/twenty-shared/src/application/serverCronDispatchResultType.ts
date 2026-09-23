export type ServerCronCursor = Record<string, unknown>;

export type ServerCronPayload<
  TCursor extends ServerCronCursor = ServerCronCursor,
> = {
  scheduledAt: string;
  step: number;
  cursor?: TCursor;
};

export type ServerCronDispatch = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload?: Record<string, unknown>;
  delayMs?: number;
};

export type ServerCronDispatchResult<
  TCursor extends ServerCronCursor = ServerCronCursor,
> = {
  dispatches: ServerCronDispatch[];
  next?: {
    cursor: TCursor;
    delayMs?: number;
  };
};
