export type McpServerTool = {
  name: string;
  description: string | null;
  inputSchema: Record<string, unknown>;
  annotations: Record<string, unknown> | null;
};
