// Connection provider names are kebab-case and unique per application. The id suffix keeps
// them unique while a URL change replaces the provider within one migration.
export const buildMcpServerSignInConnectionProviderName = ({
  mcpServerName,
  connectionProviderId,
}: {
  mcpServerName: string;
  connectionProviderId: string;
}): string =>
  `mcp-${mcpServerName.replace(/_/g, '-')}-${connectionProviderId.slice(0, 8)}`;
