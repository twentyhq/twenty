import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadata } from 'src/tenant/metadata/field-metadata/field-metadata.entity';

@Entity('object_metadata')
export class ObjectMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'data_source_id' })
  dataSourceId: string;

  @Column({ nullable: false })
  name: string;

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
