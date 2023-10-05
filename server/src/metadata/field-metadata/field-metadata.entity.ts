import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

export type FieldMetadataTargetColumnMap = {
  [key: string]: string;
};

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

  @Column({ nullable: true, name: 'description', type: 'text' })
  description: string;

  @Column({ nullable: true, name: 'icon' })
  icon: string;

  @Column({ nullable: true, name: 'placeholder' })
  placeholder: string;

  @Column({ nullable: true, name: 'target_column_map', type: 'jsonb' })
  targetColumnMap: FieldMetadataTargetColumnMap;

  @Column('text', { nullable: true, array: true })
  enums: string[];

  @Column({ default: false, name: 'is_custom' })
  isCustom: boolean;

  @Column({ default: false, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true, default: true, name: 'is_nullable' })
  isNullable: boolean;

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
