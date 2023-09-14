import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadata } from './field-metadata.entity';

// export const objectMetadataEntity = new EntitySchema({
//   name: 'object_metadata',
//   columns: {
//     id: {
//       primary: true,
//       type: 'uuid',
//       generated: 'uuid',
//     },
//     data_source_id: {
//       type: 'uuid',
//       nullable: true,
//     },
//     name: {
//       type: 'text',
//       nullable: true,
//     },
//     is_custom: {
//       type: 'boolean',
//       nullable: true,
//       default: false,
//     },
//     workspace_id: {
//       type: 'uuid',
//       nullable: true,
//     },
//   },
//   relations: {
//     fields: {
//       type: 'one-to-many',
//       target: 'field_metadata',
//       inverseSide: 'object',
//     },
//   } as any,
// });

@Entity('object_metadata')
export class ObjectMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: false })
  data_source_id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ default: false })
  is_custom: boolean;

  @Column({ nullable: false })
  workspace_id: string;

  @OneToMany(() => FieldMetadata, (field) => field.object)
  fields: FieldMetadata[];
}
