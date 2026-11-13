// An external OAuth client that members connect to Twenty themselves, such as an AI assistant
export type ApplicationOAuthClient = {
  // Matched in full against the client_id the client presents
  clientIdMetadataDocumentUrls: string[];
  // `{mcpServerUrl}` is replaced by this server's MCP endpoint
  connectUrl: string;
};
