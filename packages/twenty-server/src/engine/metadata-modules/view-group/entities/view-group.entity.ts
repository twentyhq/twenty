import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Entity({ name: 'viewGroup', schema: 'core' })
@Index('IDX_VIEW_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_GROUP_VIEW_ID', ['viewId'], {
  where: '"deletedAt" IS NULL',
})
export class ViewGroupEntity
  extends SyncableEntity
  implements Required<ViewGroupEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: true })
  isVisible: boolean;

  @Column({ nullable: false, type: 'text' })
  fieldValue: string;

  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @ManyToOne(() => ViewEntity, (view) => view.viewGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;
}
