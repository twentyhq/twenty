import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_IS_SYSTEM_SIDE_EFFECT_TO_VIEW_FIELD_GROUP_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-28/add-is-system-side-effect-to-view-field-group-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { OverridableEntity } from 'src/engine/workspace-manager/types/overridable-entity';

export type ViewFieldGroupOverrides = {
  name?: string;
  position?: number;
  isVisible?: boolean;
};

@Entity({ name: 'viewFieldGroup', schema: 'core' })
@Index('IDX_VIEW_FIELD_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_FIELD_GROUP_VIEW_ID', ['viewId'])
export class ViewFieldGroupEntity
  extends OverridableEntity<ViewFieldGroupOverrides>
  implements Required<ViewFieldGroupEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @Column({ nullable: false, default: true })
  isVisible: boolean;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_SYSTEM_SIDE_EFFECT_TO_VIEW_FIELD_GROUP_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: false, type: 'boolean' })
  isSystemSideEffect: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => ViewEntity, (view) => view.viewFieldGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @OneToMany(() => ViewFieldEntity, (viewField) => viewField.viewFieldGroup)
  viewFields: Relation<ViewFieldEntity[]>;
}
