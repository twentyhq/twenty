export const buildMcpServerSignInConnectionProviderName = ({
  mcpServerName,
  connectionProviderId,
}: {
  mcpServerName: string;
  connectionProviderId: string;
}): string =>
  `mcp-${mcpServerName.replace(/_/g, '-')}-${connectionProviderId.slice(0, 8)}`;
