import { Injectable } from '@nestjs/common';

import { PureAbility, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import {
  Activity,
  ActivityTarget,
  Attachment,
  ApiKey,
  Comment,
  Company,
  Favorite,
  Person,
  Pipeline,
  PipelineProgress,
  PipelineStage,
  RefreshToken,
  User,
  UserSettings,
  View,
  ViewField,
  ViewFilter,
  ViewSort,
  Workspace,
  WorkspaceMember,
} from '@prisma/client';

import { AbilityAction } from './ability.action';

type SubjectsAbility = Subjects<{
  Activity: Activity;
  ActivityTarget: ActivityTarget;
  Attachment: Attachment;
  ApiKey: ApiKey;
  Comment: Comment;
  Company: Company;
  Favorite: Favorite;
  Person: Person;
  Pipeline: Pipeline;
  PipelineProgress: PipelineProgress;
  PipelineStage: PipelineStage;
  RefreshToken: RefreshToken;
  User: User;
  UserSettings: UserSettings;
  View: View;
  ViewField: ViewField;
  ViewFilter: ViewFilter;
  ViewSort: ViewSort;
  Workspace: Workspace;
  WorkspaceMember: WorkspaceMember;
}>;

export type AppAbility = PureAbility<
  [string, SubjectsAbility | 'all'],
  PrismaQuery
>;

@Injectable()
export class AbilityFactory {
  defineAbility(workspace: Workspace, user?: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    // User
    can(AbilityAction.Read, 'User', {
      workspaceMember: {
        workspaceId: workspace.id,
      },
    });
    if (user) {
      can(AbilityAction.Update, 'User', { id: user.id });
      can(AbilityAction.Delete, 'User', { id: user.id });
    } else {
      cannot(AbilityAction.Update, 'User');
      cannot(AbilityAction.Delete, 'User');
    }

    // ApiKey
    can(AbilityAction.Read, 'ApiKey', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'ApiKey');
    can(AbilityAction.Delete, 'ApiKey', { workspaceId: workspace.id });

    // Workspace
    can(AbilityAction.Read, 'Workspace');
    can(AbilityAction.Update, 'Workspace');
    can(AbilityAction.Delete, 'Workspace');

    // Workspace Member
    can(AbilityAction.Read, 'WorkspaceMember', { workspaceId: workspace.id });
    if (user) {
      can(AbilityAction.Delete, 'WorkspaceMember', {
        workspaceId: workspace.id,
      });
      cannot(AbilityAction.Delete, 'WorkspaceMember', { userId: user.id });
      can(AbilityAction.Update, 'WorkspaceMember', {
        userId: user.id,
        workspaceId: workspace.id,
      });
    } else {
      cannot(AbilityAction.Delete, 'WorkspaceMember');
      cannot(AbilityAction.Update, 'WorkspaceMember');
    }

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
    if (user) {
      can(AbilityAction.Update, 'Comment', {
        workspaceId: workspace.id,
        authorId: user.id,
      });
      can(AbilityAction.Delete, 'Comment', {
        workspaceId: workspace.id,
        authorId: user.id,
      });
    } else {
      cannot(AbilityAction.Update, 'Comment');
      cannot(AbilityAction.Delete, 'Comment');
    }

    // ActivityTarget
    can(AbilityAction.Read, 'ActivityTarget');
    can(AbilityAction.Create, 'ActivityTarget');

    // Attachment
    can(AbilityAction.Read, 'Attachment', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'Attachment', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Attachment', { workspaceId: workspace.id });

    // Pipeline
    can(AbilityAction.Read, 'Pipeline', { workspaceId: workspace.id });

    // PipelineStage
    can(AbilityAction.Read, 'PipelineStage', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'PipelineStage', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'PipelineStage', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'PipelineStage', { workspaceId: workspace.id });

    // PipelineProgress
    can(AbilityAction.Read, 'PipelineProgress', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'PipelineProgress');
    can(AbilityAction.Update, 'PipelineProgress', {
      workspaceId: workspace.id,
    });
    can(AbilityAction.Delete, 'PipelineProgress', {
      workspaceId: workspace.id,
    });

    // View
    can(AbilityAction.Read, 'View', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'View', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'View', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'View', { workspaceId: workspace.id });

    // ViewField
    can(AbilityAction.Read, 'ViewField', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'ViewField', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'ViewField', { workspaceId: workspace.id });

    // ViewFilter
    can(AbilityAction.Read, 'ViewFilter', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'ViewFilter', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'ViewFilter', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'ViewFilter', { workspaceId: workspace.id });

    // ViewSort
    can(AbilityAction.Read, 'ViewSort', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'ViewSort', { workspaceId: workspace.id });
    can(AbilityAction.Update, 'ViewSort', { workspaceId: workspace.id });
    can(AbilityAction.Delete, 'ViewSort', { workspaceId: workspace.id });

    // Favorite
    can(AbilityAction.Read, 'Favorite', { workspaceId: workspace.id });
    can(AbilityAction.Create, 'Favorite');
    can(AbilityAction.Delete, 'Favorite', { workspaceId: workspace.id });

    return build();
  }
}
