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

import { ADD_CAN_CREATE_PERMISSIONS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-57/add-can-create-permissions-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('objectPermission')
@Unique('IDX_OBJECT_PERMISSION_OBJECT_METADATA_ID_ROLE_ID_UNIQUE', [
  'objectMetadataId',
  'roleId',
])
@Index('IDX_OBJECT_PERMISSION_WORKSPACE_ID_ROLE_ID', ['workspaceId', 'roleId'])
export class ObjectPermissionEntity extends SyncableEntity {
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
  canReadObjectRecords?: boolean | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_CAN_CREATE_PERMISSIONS_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'boolean' })
  canCreateObjectRecords?: boolean | null;

  @Column({ nullable: true, type: 'boolean' })
  canUpdateObjectRecords?: boolean | null;

  @Column({ nullable: true, type: 'boolean' })
  canSoftDeleteObjectRecords?: boolean | null;

  @Column({ nullable: true, type: 'boolean' })
  canDestroyObjectRecords?: boolean | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
