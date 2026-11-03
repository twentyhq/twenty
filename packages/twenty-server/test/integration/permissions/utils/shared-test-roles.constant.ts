import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';

type SharedTestRoleGrants = Pick<
  CreateRoleInput,
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
>;

type SharedTestRoleDefinition = {
  // Index into the seeded RANDOM_USER_* members; each shared role owns one
  // so its user principal can be reused across spec files.
  randomUserIndex: number;
  grants: SharedTestRoleGrants;
};

export const SHARED_TEST_ROLES = {
  noRecordAccess: { randomUserIndex: 1, grants: {} },
  onlyRead: {
    randomUserIndex: 2,
    grants: { canReadAllObjectRecords: true },
  },
  readAndUpdate: {
    randomUserIndex: 3,
    grants: { canReadAllObjectRecords: true, canUpdateAllObjectRecords: true },
  },
  readAndSoftDelete: {
    randomUserIndex: 4,
    grants: {
      canReadAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
    },
  },
  readAndDestroy: {
    randomUserIndex: 5,
    grants: { canReadAllObjectRecords: true, canDestroyAllObjectRecords: true },
  },
  allExceptUpdate: {
    randomUserIndex: 6,
    grants: {
      canReadAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    },
  },
  allExceptSoftDelete: {
    randomUserIndex: 7,
    grants: {
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    },
  },
  allExceptDestroy: {
    randomUserIndex: 8,
    grants: {
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
    },
  },
} as const satisfies Record<string, SharedTestRoleDefinition>;

export type SharedTestRoleKey = keyof typeof SHARED_TEST_ROLES;
