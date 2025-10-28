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
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Entity({ name: 'viewRole', schema: 'core' })
@Unique('IDX_VIEW_ROLE_VIEW_ID_ROLE_ID_UNIQUE', ['viewId', 'roleId'])
@Index('IDX_VIEW_ROLE_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_VIEW_ROLE_VIEW_ID', ['viewId'])
@Index('IDX_VIEW_ROLE_ROLE_ID', ['roleId'])
export class ViewRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @ManyToOne(() => ViewEntity, (view) => view.viewRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

