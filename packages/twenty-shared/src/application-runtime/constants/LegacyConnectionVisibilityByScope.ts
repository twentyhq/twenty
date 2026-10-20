import { type AppConnection } from '@/application/appConnectionType';

export const LEGACY_CONNECTION_VISIBILITY_BY_SCOPE = {
  USER: 'user',
  WORKSPACE: 'workspace',
} as const satisfies Record<
  AppConnection['scope'],
  AppConnection['visibility']
>;
