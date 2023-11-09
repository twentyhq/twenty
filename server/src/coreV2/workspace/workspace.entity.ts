import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Authorize, IDField } from '@ptc-org/nestjs-query-graphql';

import { WorkspaceMember } from 'src/coreV2/workspace-member/workspace-member.entity';
import { Company } from 'src/coreV2/company/company.entity';
import { Person } from 'src/coreV2/person/person.entity';
import { Activity } from 'src/coreV2/activity/activity.entity';
import { Comment } from 'src/coreV2/comment/comment.entity';
import { Pipeline } from 'src/coreV2/pipeline/pipeline.entity';
import { PipelineStage } from 'src/coreV2/pipeline-stage/pipeline-stage.entity';
import { PipelineProgress } from 'src/coreV2/pipeline-progress/pipeline-progress.entity';
import { ActivityTarget } from 'src/coreV2/activity-target/activity-target.entity';
import { ApiKey } from 'src/coreV2/api-key/api-key.entity';
import { WebHook } from 'src/coreV2/web-hook/web-hook.entity';
import { Attachment } from 'src/coreV2/attachment/attachment.entity';

@Entity('workspaces')
@ObjectType('workspace')
@Authorize({
  authorize: (context: any) => ({
    id: { eq: context?.req?.user?.workspace?.id },
  }),
})
export class Workspace {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  domainName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inviteHash: string;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date | null;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @OneToMany(
    () => WorkspaceMember,
    (workspaceMember) => workspaceMember.workspace,
  )
  workspaceMember: WorkspaceMember[];

  @OneToMany(() => Company, (company) => company.workspace)
  companies: Company[];

  @OneToMany(() => Person, (person) => person.workspace)
  people: Person[];

  @OneToMany(() => Activity, (activity) => activity.workspace)
  activities: Activity[];

  @OneToMany(() => Comment, (comment) => comment.workspace)
  comments: Comment[];

  @OneToMany(() => Pipeline, (pipeline) => pipeline.workspace)
  pipelines: Pipeline[];

  @OneToMany(() => PipelineStage, (pipelineStage) => pipelineStage.workspace)
  pipelineStages: PipelineStage[];

  @OneToMany(
    () => PipelineProgress,
    (pipelineProgress) => pipelineProgress.workspace,
  )
  pipelineProgresses: PipelineProgress[];

  @OneToMany(() => ActivityTarget, (activityTarget) => activityTarget.workspace)
  activityTargets: ActivityTarget[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.workspace)
  apiKeys: ApiKey[];

  @OneToMany(() => WebHook, (webHook) => webHook.workspace)
  webHooks: WebHook[];

  @OneToMany(() => Attachment, (attachment) => attachment.workspace)
  Attachment: Attachment[];
}
