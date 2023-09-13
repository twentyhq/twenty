import { EntitySchema } from 'typeorm';

export const objectMetadataEntity = new EntitySchema({
  name: 'object_metadata',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    data_source_id: {
      type: 'uuid',
      nullable: true,
    },
    name: {
      type: 'text',
      nullable: true,
    },
    is_custom: {
      type: 'boolean',
      nullable: true,
      default: false,
    },
    workspace_id: {
      type: 'uuid',
      nullable: true,
    },
  },
  relations: {
    fields: {
      type: 'one-to-many',
      target: 'field_metadata',
      inverseSide: 'object',
    },
  } as any,
});
