import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'viewGroup', schema: 'core' })
@Index('IDX_VIEW_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_GROUP_VIEW_ID', ['viewId'])
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => ViewEntity, (view) => view.viewGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;
}
