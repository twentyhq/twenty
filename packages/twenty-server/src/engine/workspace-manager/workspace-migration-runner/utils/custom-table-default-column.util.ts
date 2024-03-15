import { TableColumnOptions } from 'typeorm';

export const customTableDefaultColumns: TableColumnOptions[] = [
  {
    name: 'id',
    type: 'uuid',
    isPrimary: true,
    default: 'public.uuid_generate_v4()',
  },
  {
    name: 'createdAt',
    type: 'timestamp',
    default: 'now()',
  },
  {
    name: 'updatedAt',
    type: 'timestamp',
    default: 'now()',
  },
  {
    name: 'deletedAt',
    type: 'timestamp',
    isNullable: true,
  },
];
