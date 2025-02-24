import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('object_conversion_settings')
export class ObjectConversionSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  objectMetadataId: string;

  @Column({ default: false })
  isConversionSource: boolean;

  @Column({ default: false })
  showConvertButton: boolean;

  @Column({ type: 'uuid', nullable: false })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
