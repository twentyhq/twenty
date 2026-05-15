import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('permissionFlag')
@Unique('IDX_PERMISSION_FLAG_KEY_WORKSPACE_ID_UNIQUE', ['key', 'workspaceId'])
@Index('IDX_PERMISSION_FLAG_APPLICATION_ID', ['applicationId'])
export class PermissionFlagEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  key: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  iconKey: string | null;

  @OneToMany(
    () => RolePermissionFlagEntity,
    (rolePermissionFlag) => rolePermissionFlag.permissionFlag,
  )
  rolePermissionFlags: Relation<RolePermissionFlagEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
