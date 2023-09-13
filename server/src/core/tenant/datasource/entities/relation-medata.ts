import { EntitySchema } from 'typeorm';

export const relationMetadataEntity = new EntitySchema({
  name: 'relation_metadata',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    source_field_id: {
      type: 'uuid',
      nullable: true,
    },
    target_object_id: {
      type: 'uuid',
      nullable: true,
    },
    target_foreign_key: {
      type: 'uuid',
      nullable: true,
    },
    type: {
      type: 'text',
      nullable: true,
    },
    workspace_id: {
      type: 'uuid',
      nullable: true,
    },
  },
});
