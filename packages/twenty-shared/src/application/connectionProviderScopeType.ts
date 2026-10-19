import { type CONNECTION_PROVIDER_SCOPES } from '@/application/constants/ConnectionProviderScopes';

export type ConnectionProviderScope =
  (typeof CONNECTION_PROVIDER_SCOPES)[number];
