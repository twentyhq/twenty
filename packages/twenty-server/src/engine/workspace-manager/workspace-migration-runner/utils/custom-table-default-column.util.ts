import { TableColumnOptions } from 'typeorm';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

export const customTableDefaultColumns = (
  tableName: string,
): TableColumnOptions[] => [
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
  {
    name: 'position',
    type: 'float',
    isNullable: true,
  },
  {
    name: 'name',
    type: 'text',
    isNullable: false,
    default: "'Untitled'",
  },
  {
    name: 'createdBySource',
    type: 'enum',
    enumName: `${tableName}_createdBySource_enum`,
    enum: Object.values(FieldActorSource),
    isNullable: false,
    default: `'${FieldActorSource.MANUAL}'`,
  },
  { name: 'createdByWorkspaceMemberId', type: 'uuid', isNullable: true },
  {
    name: 'createdByName',
    type: 'text',
    isNullable: false,
    default: "''",
  },
];
