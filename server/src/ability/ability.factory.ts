import { PureAbility, AbilityBuilder, subject } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import {
  CommentThread,
  Company,
  Comment,
  Person,
  RefreshToken,
  User,
  Workspace,
  WorkspaceMember,
  CommentThreadTarget,
  Pipeline,
  PipelineStage,
  PipelineProgress,
} from '@prisma/client';
import { AbilityAction } from './ability.action';

type SubjectsAbility = Subjects<{
  User: User;
  Workspace: Workspace;
  WorkspaceMember: WorkspaceMember;
  Company: Company;
  Person: Person;
  RefreshToken: RefreshToken;
  CommentThread: CommentThread;
  Comment: Comment;
  CommentThreadTarget: CommentThreadTarget;
  Pipeline: Pipeline;
  PipelineStage: PipelineStage;
  PipelineProgress: PipelineProgress;
}>;

export type AppAbility = PureAbility<
  [string, SubjectsAbility | 'all'],
  PrismaQuery
>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User, workspace: Workspace) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    // User
    can(AbilityAction.Update, 'User', { id: user.id });
    cannot(AbilityAction.Delete, 'User');

    // Workspace
    can(AbilityAction.Read, 'Workspace', { id: workspace.id });

    // Workspace Member
    can(AbilityAction.Read, 'WorkspaceMember', { userId: user.id });

    // Company
    can(AbilityAction.Read, 'Company', { workspaceId: workspace.id });

    // Person
    can(AbilityAction.Read, 'Person', { workspaceId: workspace.id });

    // RefreshToken
    cannot(AbilityAction.Manage, 'RefreshToken');

    // CommentThread
    can(AbilityAction.Read, 'CommentThread', { workspaceId: workspace.id });

    // Comment
    can(AbilityAction.Read, 'Comment', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'Comment', {
      workspaceId: workspace.id,
      authorId: user.id,
    });
    can(AbilityAction.Delete, 'Comment', {
      workspaceId: workspace.id,
      authorId: user.id,
    });

    // CommentThreadTarget
    can(AbilityAction.Read, 'CommentThreadTarget');

    // Pipeline
    can(AbilityAction.Read, 'Pipeline', { workspaceId: workspace.id });

    // PipelineStage
    can(AbilityAction.Read, 'PipelineStage', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'PipelineStage', { workspaceId: workspace.id });

    // PipelineProgress
    can(AbilityAction.Read, 'PipelineProgress', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'PipelineProgress');
    can(AbilityAction.Update, 'PipelineProgress', {
      workspaceId: workspace.id,
    });

    return build();
  }
}
