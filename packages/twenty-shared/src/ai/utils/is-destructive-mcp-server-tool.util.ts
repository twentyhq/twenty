export type McpServerToolAnnotationsHints = {
  readOnlyHint?: boolean | null;
  destructiveHint?: boolean | null;
};

export const isDestructiveMcpServerTool = ({
  annotations,
}: {
  annotations?: McpServerToolAnnotationsHints | null;
}): boolean =>
  !annotations?.readOnlyHint && annotations?.destructiveHint !== false;
