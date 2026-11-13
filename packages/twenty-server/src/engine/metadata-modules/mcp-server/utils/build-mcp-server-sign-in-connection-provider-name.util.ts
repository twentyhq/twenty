// The id suffix keeps the name unique while a URL change replaces the provider within one migration.
export const buildMcpServerSignInConnectionProviderName = ({
  mcpServerName,
  connectionProviderId,
}: {
  mcpServerName: string;
  connectionProviderId: string;
}): string =>
  `mcp-${mcpServerName.replace(/_/g, '-')}-${connectionProviderId.slice(0, 8)}`;
