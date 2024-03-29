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
    type: 'timestamptz',
    default: 'now()',
  },
  {
    name: 'updatedAt',
    type: 'timestamptz',
    default: 'now()',
  },
  {
    name: 'deletedAt',
    type: 'timestamptz',
    isNullable: true,
  },
];
