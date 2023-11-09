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

@Entity('companies')
export class Company {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.companies)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
