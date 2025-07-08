import { ValidateBy } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Entity('fieldPermission')
@Unique('IDX_FIELD_PERMISSION_FIELD_METADATA_ID_ROLE_ID_UNIQUE', [
  'fieldMetadataId',
  'roleId',
])
@Index('IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID', ['workspaceId', 'roleId'])
export class FieldPermissionEntity {
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

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
