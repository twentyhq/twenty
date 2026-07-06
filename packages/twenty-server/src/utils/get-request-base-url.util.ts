import { type Request } from 'express';

// Absolute origin the request arrived on. Honors the reverse proxy through
// Express `trust proxy` (X-Forwarded-Proto / Host), so a workspace subdomain
// or custom domain advertises its own host in self-referential discovery URLs
// (OAuth metadata, MCP server card, api-catalog).
export const getRequestBaseUrl = (request: Request): string =>
  `${request.protocol}://${request.get('host')}`;
