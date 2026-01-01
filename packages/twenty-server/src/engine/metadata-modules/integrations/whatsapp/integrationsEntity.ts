import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
  Unique,
} from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'whatsapp_integration', schema: 'core' })
export class IntegrationsEntity implements Required<IntegrationsEntity> {
  @Unique('whatsapp_integration_UQ_WABA_ID', ['whatsappBusinessAccountId'])
  @PrimaryColumn()
  whatsappBusinessAccountId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  @Column({ nullable: false })
  workspace!: Relation<WorkspaceEntity>;

  @Unique('whatsapp_integration_UQ_WA_WEBHOOK_TOKEN', ['whatsappToken'])
  whatsappToken: string;
}
