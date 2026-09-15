export const DATABASE_CRUD_OPERATIONS = [
  'find_many',
  'find_one',
  'group_by',
  'create_one',
  'create_many',
  'update_one',
  'update_many',
  'upsert_many',
  'delete_one',
  'delete_many',
] as const;

export type DatabaseCrudOperation = (typeof DATABASE_CRUD_OPERATIONS)[number];
