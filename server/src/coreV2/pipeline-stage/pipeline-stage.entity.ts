import { ID } from '@nestjs/graphql';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { Workspace } from 'src/coreV2/workspace/workspace.entity';

@Entity('pipeline_stages')
export class PipelineStage {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.pipelineStages)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
