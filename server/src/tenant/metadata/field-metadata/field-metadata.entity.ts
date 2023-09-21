import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectMetadata } from 'src/tenant/metadata/object-metadata/object-metadata.entity';

@Entity('field_metadata')
export class FieldMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'object_id' })
  objectId: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false, name: 'display_name' })
  displayName: string;

  @Column({ nullable: false, name: 'target_column_name' })
  targetColumnName: string;

  @Column({ default: false, name: 'is_custom' })
  isCustom: boolean;

  @Column({ nullable: false, name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => ObjectMetadata, (object) => object.fields)
  @JoinColumn({ name: 'object_id' })
  object: ObjectMetadata;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
