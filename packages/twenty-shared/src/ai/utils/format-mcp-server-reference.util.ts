export const formatMcpServerReference = ({
  mcpServerId,
  label,
}: {
  mcpServerId: string;
  label: string;
}): string => `[[mcpServer:${mcpServerId}:${label}]]`;
