import { EntitySchema } from 'typeorm';

export const fieldMetadataEntity = new EntitySchema({
  name: 'field_metadata',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    object_id: {
      type: 'uuid',
      nullable: true,
    },
    type: {
      type: 'text',
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
    object: {
      type: 'many-to-one',
      target: 'object_metadata',
      joinColumn: {
        name: 'object_id',
        referencedColumnName: 'id',
      },
      inverseSide: 'fields',
    },
  } as any,
});
