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

@Entity('pipeline_progresses')
export class PipelineProgress {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.pipelineProgresses)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
