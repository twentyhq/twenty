import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type JobGroupLimiter } from 'twenty-shared/application';

import { ADD_JOB_GROUPS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-61/add-job-groups-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'jobGroup', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_JOB_GROUPS_UPGRADE_COMMAND_NAME,
})
@Index('IDX_JOB_GROUP_WORKSPACE_ID_APPLICATION_ID', [
  'workspaceId',
  'applicationId',
])
export class JobGroupEntity
  extends SyncableEntity
  implements Required<JobGroupEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'jsonb' })
  limiter: JsonbProperty<JobGroupLimiter>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
