import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'integration', schema: 'core' })
@Index(['whatsappWebhookToken'], { unique: true })
@Index(['whatsappBusinessAccountId', 'workspaceId'], { unique: true })
export class IntegrationsEntity implements Required<IntegrationsEntity> {
  @Column({ nullable: true })
  whatsappBusinessAccountId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @PrimaryColumn({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: true })
  whatsappWebhookToken: string;
}
