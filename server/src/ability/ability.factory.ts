import { Injectable } from '@nestjs/common';

import { PureAbility, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
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
  Attachment,
  UserSettings,
  Favorite,
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
  Attachment: Attachment;
  UserSettings: UserSettings;
  Favorite: Favorite;
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
    can(AbilityAction.Read, 'User', {
      workspaceMember: {
        workspaceId: workspace.id,
      },
    });
    can(AbilityAction.Update, 'User', { id: user.id });
    cannot(AbilityAction.Delete, 'User');

    // Workspace
    can(AbilityAction.Read, 'Workspace');
    can(AbilityAction.Update, 'Workspace');
    can(AbilityAction.Delete, 'Workspace');

    // Workspace Member
    can(AbilityAction.Read, 'WorkspaceMember', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'WorkspaceMember', { workspaceId: workspace.id });
    cannot(AbilityAction.Delete, 'WorkspaceMember', { userId: user.id });

    // Company
    can(AbilityAction.Read, 'Company', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Company');
    can(AbilityAction.Update, 'Company', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'Company', { workspaceId: workspace.id });

    // Person
    can(AbilityAction.Read, 'Person', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Person');
    can(AbilityAction.Update, 'Person', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'Person', { workspaceId: workspace.id });

    // RefreshToken
    cannot(AbilityAction.Manage, 'RefreshToken');

    // CommentThread
    can(AbilityAction.Read, 'CommentThread', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'CommentThread');
    can(AbilityAction.Update, 'CommentThread', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'CommentThread', { workspaceId: workspace.id });

    // Comment
    can(AbilityAction.Read, 'Comment', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Comment');
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
    can(AbilityAction.Create, 'CommentThreadTarget');

    // Attachment
    can(AbilityAction.Read, 'Attachment', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'Attachment', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Attachment', { workspaceId: workspace.id });

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
    can(AbilityAction.Delete, 'PipelineProgress', {
      workspaceId: workspace.id,
    });

    //Favorite
    can(AbilityAction.Read, 'Favorite', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Favorite');
    can(AbilityAction.Delete, 'Favorite', {
      workspaceId: workspace.id,
    });

    return build();
  }
}
