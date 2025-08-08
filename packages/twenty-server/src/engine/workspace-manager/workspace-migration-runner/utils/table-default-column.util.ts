import { type TableColumnOptions } from 'typeorm';

export const tableDefaultColumns = (): TableColumnOptions[] => [
  {
    name: 'id',
    type: 'uuid',
    isPrimary: true,
    default: 'public.uuid_generate_v4()',
  },
];
