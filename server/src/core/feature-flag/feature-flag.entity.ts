import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Workspace } from 'src/core/workspace/workspace.entity';

@Entity({ name: 'featureFlag', schema: 'core' })
@Unique('IndexOnKeyAndWorkspaceIdUnique', ['key', 'workspaceId'])
export class FeatureFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.featureFlags, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Column({ nullable: false })
  value: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
