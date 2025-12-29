import { Column, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import type { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity {
  @Column({ nullable: true, type: 'uuid' })
  // TODO should not be nullable
  universalIdentifier: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: true, type: 'uuid' })
  applicationId: string | null;

  @ManyToOne('ApplicationEntity', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;
}
