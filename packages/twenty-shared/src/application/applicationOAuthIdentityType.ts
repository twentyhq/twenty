// An external OAuth client members connect to Twenty, such as an AI assistant.
// Twenty recognizes it by its callbacks, so only a trusted publisher may declare one.
export type ApplicationOAuthIdentity = {
  // A `*` path segment matches any one segment
  redirectUris: string[];
  clientIdMetadataDocumentHostnames?: string[];
  // `{mcpServerUrl}` is replaced by this server's MCP endpoint
  connectUrl: string;
};
