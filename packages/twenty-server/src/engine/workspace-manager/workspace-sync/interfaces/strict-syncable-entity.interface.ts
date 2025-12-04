import { Column, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import type { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export abstract class StrictSyncableEntity {
  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationId: string;

  @ManyToOne('ApplicationEntity', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;
}

