import { type AppConnection } from '@/application/appConnectionType';

export const CONNECTION_SCOPE_BY_LEGACY_VISIBILITY = {
  user: 'USER',
  workspace: 'WORKSPACE',
} as const satisfies Record<
  AppConnection['visibility'],
  AppConnection['scope']
>;
