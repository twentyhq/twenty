import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity('skill')
@Index('IDX_SKILL_ID_DELETED_AT', ['id', 'deletedAt'])
@Index('IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE', ['name', 'workspaceId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class SkillEntity
  extends SyncableEntity
  implements Required<SkillEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId: string | null;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ default: false })
  isCustom: boolean;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
