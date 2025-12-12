import { Column, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import type { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class SyncableEntity {
  @Column({ nullable: true, type: 'uuid' })
  // TODO should not be nullable
  universalIdentifier: string;

  @Column({ nullable: true, type: 'uuid' })
  applicationId: string | null;

  @ManyToOne('ApplicationEntity', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;
}
