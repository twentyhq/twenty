import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { type PermissionFlagPermissionType } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
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

  @Column({ nullable: false, type: 'varchar' })
  permissionType: PermissionFlagPermissionType;

  @Column({ nullable: false, type: 'boolean', default: false })
  isRelevantForAgents: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  isRelevantForUsers: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  isRelevantForApiKeys: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  isCustom: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
