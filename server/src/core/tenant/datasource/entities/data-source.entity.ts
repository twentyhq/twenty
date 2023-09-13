import { EntitySchema } from 'typeorm';

export const dataSourceEntity = new EntitySchema({
  name: 'data_sources',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    url: {
      type: 'text',
      nullable: true,
    },
    schema: {
      type: 'text',
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
    is_remote: {
      type: 'boolean',
      nullable: true,
      default: false,
    },
    workspace_id: {
      type: 'uuid',
      nullable: true,
    },
  },
});
