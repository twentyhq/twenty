import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const WORKSPACE_FIELDS_TO_SEED = [
  'id',
  'displayName',
  'subdomain',
  'inviteHash',
  'logo',
  'activationStatus',
  'isTwoFactorAuthenticationEnforced',
  'workspaceCustomApplicationId',
] as const satisfies (keyof WorkspaceEntity)[];

export type CreateWorkspaceInput = Pick<
  WorkspaceEntity,
  (typeof WORKSPACE_FIELDS_TO_SEED)[number]
>;

export const SEED_APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SEED_YCOMBINATOR_WORKSPACE_ID =
  '3b8e6458-5fc1-4e63-8563-008ccddaa6db';
export const SEED_EMPTY_WORKSPACE_3_ID = '506915ec-21ca-431b-a04a-257eb216865e';
export const SEED_EMPTY_WORKSPACE_4_ID = 'aa8fdcb1-8ee1-4012-98af-44a97caa7411';

export type SeededWorkspacesIds =
  | typeof SEED_APPLE_WORKSPACE_ID
  | typeof SEED_YCOMBINATOR_WORKSPACE_ID;

export type SeededEmptyWorkspacesIds =
  | typeof SEED_EMPTY_WORKSPACE_3_ID
  | typeof SEED_EMPTY_WORKSPACE_4_ID;

// The "apple" seed slot is repurposed as the SSO landing workspace in the
// foss-server-bundle-devstack: ForwardAuth + Traefik route
// foss-twenty.<DOMAIN> to the workspace whose subdomain matches the
// bundle's SMB_NAME (the canonical per-deployment tenant identifier wired
// into every app via docker-compose). Fall back to the upstream "apple"
// identity when SMB_NAME is unset so dev/test runs that don't set it stay
// byte-for-byte compatible with twentyhq.
const SEED_WORKSPACE_SUBDOMAIN = process.env.SMB_NAME ?? 'apple';
const SEED_WORKSPACE_DISPLAY_NAME =
  SEED_WORKSPACE_SUBDOMAIN.charAt(0).toUpperCase() +
  SEED_WORKSPACE_SUBDOMAIN.slice(1);

export const SEEDER_CREATE_WORKSPACE_INPUT = {
  [SEED_APPLE_WORKSPACE_ID]: {
    id: SEED_APPLE_WORKSPACE_ID,
    displayName: SEED_WORKSPACE_DISPLAY_NAME,
    subdomain: SEED_WORKSPACE_SUBDOMAIN,
    inviteHash: 'apple.dev-invite-hash',
    logo: 'https://twentyhq.github.io/placeholder-images/workspaces/apple-logo.png',
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // will be set to active after default role creation
    isTwoFactorAuthenticationEnforced: false,
  },
  [SEED_YCOMBINATOR_WORKSPACE_ID]: {
    id: SEED_YCOMBINATOR_WORKSPACE_ID,
    displayName: 'YCombinator',
    subdomain: 'yc',
    inviteHash: 'yc.dev-invite-hash',
    logo: 'https://twentyhq.github.io/placeholder-images/workspaces/ycombinator-logo.png',
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // will be set to active after default role creation
    isTwoFactorAuthenticationEnforced: false,
  },
} as const satisfies Record<
  SeededWorkspacesIds,
  Omit<CreateWorkspaceInput, 'workspaceCustomApplicationId'>
>;

// Empty workspaces with no users, metadata, or data — used by integration tests
// that need more than 2 workspaces (e.g. upgrade sequence runner tests).
export const SEEDER_CREATE_EMPTY_WORKSPACE_INPUT = {
  [SEED_EMPTY_WORKSPACE_3_ID]: {
    id: SEED_EMPTY_WORKSPACE_3_ID,
    displayName: 'Empty3',
    subdomain: 'empty3',
    inviteHash: 'empty3.dev-invite-hash',
    logo: '',
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    isTwoFactorAuthenticationEnforced: false,
  },
  [SEED_EMPTY_WORKSPACE_4_ID]: {
    id: SEED_EMPTY_WORKSPACE_4_ID,
    displayName: 'Empty4',
    subdomain: 'empty4',
    inviteHash: 'empty4.dev-invite-hash',
    logo: '',
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    isTwoFactorAuthenticationEnforced: false,
  },
} as const satisfies Record<
  SeededEmptyWorkspacesIds,
  Omit<CreateWorkspaceInput, 'workspaceCustomApplicationId'>
>;
