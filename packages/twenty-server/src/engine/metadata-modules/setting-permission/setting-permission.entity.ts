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

import { Setting } from 'src/engine/metadata-modules/permissions/constants/setting.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Entity('settingPermission')
@Unique('IndexOnSettingPermissionUnique', ['setting', 'roleId'])
export class SettingPermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.settingPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'varchar' })
  setting: Setting;

  @Column({ nullable: true, type: 'boolean' })
  canUpdateSetting?: boolean;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
