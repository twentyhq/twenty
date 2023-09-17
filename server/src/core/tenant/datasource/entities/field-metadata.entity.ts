import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectMetadata } from './object-metadata';

// export const fieldMetadataEntity = new EntitySchema({
//   name: 'field_metadata',
//   columns: {
//     id: {
//       primary: true,
//       type: 'uuid',
//       generated: 'uuid',
//     },
//     object_id: {
//       type: 'uuid',
//       nullable: true,
//     },
//     type: {
//       type: 'text',
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
//     object: {
//       type: 'many-to-one',
//       target: 'object_metadata',
//       joinColumn: {
//         name: 'object_id',
//         referencedColumnName: 'id',
//       },
//       inverseSide: 'fields',
//     },
//   } as any,
// });

@Entity('field_metadata')
export class FieldMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: false })
  object_id: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  name: string;

  @Column({ default: false })
  is_custom: boolean;

  @Column({ nullable: false })
  workspace_id: string;

  @ManyToOne(() => ObjectMetadata, (object) => object.fields)
  @JoinColumn({ name: 'object_id' })
  object: ObjectMetadata;
}
