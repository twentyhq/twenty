import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';

@Entity('objectMetadata')
@Unique('IndexOnNameSingularAndWorkspaceIdUnique', [
  'nameSingular',
  'workspaceId',
])
@Unique('IndexOnNamePluralAndWorkspaceIdUnique', ['namePlural', 'workspaceId'])
export class ObjectMetadataEntity implements ObjectMetadataInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  dataSourceId: string;

  @Column({ nullable: false })
  nameSingular: string;

  @Column({ nullable: false })
  namePlural: string;

  @Column({ nullable: false })
  labelSingular: string;

  @Column({ nullable: false })
  labelPlural: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: false })
  targetTableName: string;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ nullable: true })
  labelIdentifierFieldMetadataId?: string;

  @Column({ nullable: true })
  imageIdentifierFieldMetadataId?: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @OneToMany(() => FieldMetadataEntity, (field) => field.object, {
    cascade: true,
  })
  fields: FieldMetadataEntity[];

  @OneToMany(
    () => RelationMetadataEntity,
    (relation: RelationMetadataEntity) => relation.fromObjectMetadata,
    {
      cascade: true,
    },
  )
  fromRelations: RelationMetadataEntity[];

  @OneToMany(
    () => RelationMetadataEntity,
    (relation: RelationMetadataEntity) => relation.toObjectMetadata,
    {
      cascade: true,
    },
  )
  toRelations: RelationMetadataEntity[];

  @ManyToOne(() => DataSourceEntity, (dataSource) => dataSource.objects, {
    onDelete: 'CASCADE',
  })
  dataSource: DataSourceEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
