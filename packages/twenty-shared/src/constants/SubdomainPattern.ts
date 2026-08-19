// 1-30 chars: lowercase alphanumeric and hyphens, must start and end
// with a letter or number, must not start with "api-"
export const SUBDOMAIN_PATTERN =
  /^(?!api-)[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;
