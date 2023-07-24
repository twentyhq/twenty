import { Injectable } from '@nestjs/common';

import { PureAbility, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import {
  Attachment,
  Activity,
  Company,
  Comment,
  Person,
  RefreshToken,
  User,
  Workspace,
  WorkspaceMember,
  ActivityTarget,
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
  Activity: Activity;
  Comment: Comment;
  ActivityTarget: ActivityTarget;
  Pipeline: Pipeline;
  PipelineStage: PipelineStage;
  PipelineProgress: PipelineProgress;
  Attachment: Attachment;
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
    can(AbilityAction.Read, 'Workspace', { id: workspace.id });
    can(AbilityAction.Update, 'Workspace', { id: workspace.id });

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

    // Activity
    can(AbilityAction.Read, 'Activity', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Activity');
    can(AbilityAction.Update, 'Activity', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'Activity', { workspaceId: workspace.id });

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

    // ActivityTarget
    can(AbilityAction.Read, 'ActivityTarget');

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

    return build();
  }
}
