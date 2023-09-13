export const baseColumns = {
  id: {
    primary: true,
    type: 'uuid',
    generated: 'uuid',
  },
  created_at: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
    isNullable: false,
  },
  updated_at: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
    isNullable: false,
  },
};
