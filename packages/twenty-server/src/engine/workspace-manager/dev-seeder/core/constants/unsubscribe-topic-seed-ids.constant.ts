import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const UNSUBSCRIBE_TOPIC_DATA_SEED_IDS = {
  PRODUCT_UPDATES: '20202020-7b1c-4a2d-8e3f-300000000001',
  NEWSLETTER: '20202020-7b1c-4a2d-8e3f-300000000002',
  TRANSACTIONAL: '20202020-7b1c-4a2d-8e3f-300000000003',
} as const;

// YC workspace needs its own entity IDs since core tables have a single PK
const YC_UNSUBSCRIBE_TOPIC_DATA_SEED_IDS = {
  PRODUCT_UPDATES: '30303030-7b1c-4a2d-8e3f-300000000001',
  NEWSLETTER: '30303030-7b1c-4a2d-8e3f-300000000002',
  TRANSACTIONAL: '30303030-7b1c-4a2d-8e3f-300000000003',
} as const;

export const getUnsubscribeTopicDataSeedIds = (workspaceId: string) =>
  workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID
    ? YC_UNSUBSCRIBE_TOPIC_DATA_SEED_IDS
    : UNSUBSCRIBE_TOPIC_DATA_SEED_IDS;
