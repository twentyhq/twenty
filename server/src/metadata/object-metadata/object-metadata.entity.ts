import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

@Entity('object_metadata')
export class ObjectMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'data_source_id' })
  dataSourceId: string;

  @Column({ nullable: false, name: 'display_name' })
  displayName: string;

  @Column({ nullable: false, name: 'target_table_name' })
  targetTableName: string;

  @Column({ default: false, name: 'is_custom' })
  isCustom: boolean;

  @Column({ nullable: false, name: 'workspace_id' })
  workspaceId: string;

  @OneToMany(() => FieldMetadata, (field) => field.object)
  fields: FieldMetadata[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
