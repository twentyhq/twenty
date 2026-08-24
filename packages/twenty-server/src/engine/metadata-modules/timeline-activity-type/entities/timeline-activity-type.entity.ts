import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { type APP_LOCALES } from 'twenty-shared/translations';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import {
  ADD_TIMELINE_ACTIVITY_TYPE_REPLACEMENT_UPGRADE_COMMAND_NAME,
  ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
  REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
  TIMELINE_ACTIVITY_TYPE_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
} from 'src/database/commands/upgrade-version-command/2-34/timeline-activity-type-upgrade-command-name.constants';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';

import { OverridableEntity } from 'src/engine/workspace-manager/types/overridable-entity';

export type TimelineActivityTypeOverrides = {
  label?: string;
  icon?: string | null;
  translations?: Partial<
    Record<keyof typeof APP_LOCALES, { label?: string | null }>
  > | null;
};

@Entity({ name: 'timelineActivityType', schema: 'core' })
@Unique('IDX_TIMELINE_ACTIVITY_TYPE_NAME_APPLICATION_WORKSPACE_UNIQUE', [
  'name',
  'applicationId',
  'workspaceId',
])
@Index('IDX_TIMELINE_ACTIVITY_TYPE_BASE_EMIT_SLOT_UNIQUE', {
  synchronize: false,
})
@Index('IDX_TIMELINE_ACTIVITY_TYPE_OVERRIDE_EMIT_SLOT_UNIQUE', {
  synchronize: false,
})
export class TimelineActivityTypeEntity
  extends OverridableEntity<TimelineActivityTypeOverrides>
  implements Required<TimelineActivityTypeEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  // The verb used by automatic audit writers to resolve a type. Null leaves
  // the type available only to explicit writers addressing its identifier.
  @Column({ nullable: true, type: 'varchar' })
  action: TimelineActivityAction | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  // A 2.33 server still selects this column during a rolling deployment. It is
  // no longer mapped into current metadata. The decorator and physical drop
  // are both deferred to 2.35; the branded type lets flat builders omit it.
  @Column({ nullable: true, type: 'varchar' })
  renderer: WasRemovedInUpgrade<string | null>;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
  })
  // Native renderers reserve identifiers in this namespace so snapshots use
  // the same live-first resolution path as application front components.
  @Column({ nullable: true, type: 'uuid' })
  frontComponentUniversalIdentifier: string | null;

  // The object whose records this entry is about, as a soft reference rather
  // than a relation: it is resolved through the flat maps at write time to pick
  // the type for an event, and null means any object.
  @Column({ nullable: true, type: 'uuid' })
  objectUniversalIdentifier: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  targetRelationFieldUniversalIdentifier: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid', array: true })
  triggerFieldUniversalIdentifiers: string[] | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_TIMELINE_ACTIVITY_TYPE_REPLACEMENT_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  replacesTimelineActivityTypeUniversalIdentifier: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

WasIntroducedInUpgrade({
  upgradeCommandName:
    TIMELINE_ACTIVITY_TYPE_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
})(TimelineActivityTypeEntity.prototype, 'overrides');
WasIntroducedInUpgrade({
  upgradeCommandName:
    TIMELINE_ACTIVITY_TYPE_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
})(TimelineActivityTypeEntity.prototype, 'isActive');
