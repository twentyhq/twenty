import { PermissionFlagType } from 'twenty-shared/constants';
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

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('permissionFlagGrant')
@Unique('IDX_PERMISSION_FLAG_GRANT_FLAG_ROLE_ID_UNIQUE', ['flag', 'roleId'])
@Index('IDX_PERMISSION_FLAG_GRANT_ROLE_ID', ['roleId'])
export class PermissionFlagGrantEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.permissionFlagGrants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'varchar' })
  flag: PermissionFlagType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
