import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Entity('objectPermission')
@Unique('IDX_OBJECT_PERMISSION_OBJECT_METADATA_ID_ROLE_ID_UNIQUE', [
  'objectMetadataId',
  'roleId',
])
export class ObjectPermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.objectPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @ManyToOne(
    () => ObjectMetadataEntity,
    (objectMetadata) => objectMetadata.objectPermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity>;

  @Column({ nullable: true, type: 'boolean' })
  canReadObjectRecords?: boolean;

  @Column({ nullable: true, type: 'boolean' })
  canUpdateObjectRecords?: boolean;

  @Column({ nullable: true, type: 'boolean' })
  canSoftDeleteObjectRecords?: boolean;

  @Column({ nullable: true, type: 'boolean' })
  canDestroyObjectRecords?: boolean;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
