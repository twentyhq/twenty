export const baseColumns = {
  id: {
    primary: true,
    type: 'uuid',
    generated: 'uuid',
  },
  createdAt: {
    type: 'timestamp',
    createDate: true,
  },
  updatedAt: {
    type: 'timestamp',
    updateDate: true,
  },
} as const;
