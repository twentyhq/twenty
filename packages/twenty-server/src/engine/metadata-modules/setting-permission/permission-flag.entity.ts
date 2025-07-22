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

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Entity('permissionFlag')
@Unique('IDX_SETTING_PERMISSION_SETTING_ROLE_ID_UNIQUE', [
  'permissionFlag',
  'roleId',
])
export class PermissionFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.permissionFlags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'varchar' })
  permissionFlag: PermissionFlagType;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
