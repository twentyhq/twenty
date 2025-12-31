import { ValidateBy } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Entity('fieldPermission')
@Unique('IDX_FIELD_PERMISSION_FIELD_METADATA_ID_ROLE_ID_UNIQUE', [
  'fieldMetadataId',
  'roleId',
])
@Index('IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID', ['workspaceId', 'roleId'])
export class FieldPermissionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.fieldPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata) => objectMetadata.fieldPermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @ManyToOne(
    () => FieldMetadataEntity,
    (fieldMetadata) => fieldMetadata.fieldPermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({ nullable: true, type: 'boolean' })
  canReadFieldValue?: boolean | null;

  @ValidateBy({
    name: 'isFalseOrNull',
    validator: {
      validate: (value: boolean | null) => value === false || value === null,
      defaultMessage: () => 'value must be either false or null',
    },
  })
  @Column({ nullable: true, type: 'boolean' })
  canUpdateFieldValue?: boolean | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
