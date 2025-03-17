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

import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Entity('settingsPermissions')
@Unique('IndexOnSettingsPermissionsUnique', ['setting', 'roleId'])
export class SettingsPermissionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.settingsPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'varchar' })
  setting: SettingsPermissions;

  @Column({ nullable: true, type: 'boolean' })
  canUpdateSetting?: boolean;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
