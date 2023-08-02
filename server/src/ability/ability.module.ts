import { Global, Module } from '@nestjs/common';

import { AbilityFactory } from 'src/ability/ability.factory';
import { PrismaService } from 'src/database/prisma.service';

import {
  CreateUserAbilityHandler,
  DeleteUserAbilityHandler,
  ManageUserAbilityHandler,
  ReadUserAbilityHandler,
  UpdateUserAbilityHandler,
} from './handlers/user.ability-handler';
import {
  CreateWorkspaceAbilityHandler,
  DeleteWorkspaceAbilityHandler,
  ManageWorkspaceAbilityHandler,
  ReadWorkspaceAbilityHandler,
  UpdateWorkspaceAbilityHandler,
} from './handlers/workspace.ability-handler';
import {
  CreateWorkspaceMemberAbilityHandler,
  DeleteWorkspaceMemberAbilityHandler,
  ManageWorkspaceMemberAbilityHandler,
  ReadWorkspaceMemberAbilityHandler,
  UpdateWorkspaceMemberAbilityHandler,
} from './handlers/workspace-member.ability-handler';
import {
  ManageCompanyAbilityHandler,
  ReadOneCompanyAbilityHandler,
  CreateCompanyAbilityHandler,
  UpdateCompanyAbilityHandler,
  DeleteCompanyAbilityHandler,
} from './handlers/company.ability-handler';
import {
  CreatePersonAbilityHandler,
  DeletePersonAbilityHandler,
  ManagePersonAbilityHandler,
  ReadPersonAbilityHandler,
  UpdatePersonAbilityHandler,
} from './handlers/person.ability-handler';
import {
  ManageRefreshTokenAbilityHandler,
  ReadRefreshTokenAbilityHandler,
  CreateRefreshTokenAbilityHandler,
  UpdateRefreshTokenAbilityHandler,
  DeleteRefreshTokenAbilityHandler,
} from './handlers/refresh-token.ability-handler';
import {
  ManageActivityAbilityHandler,
  ReadActivityAbilityHandler,
  CreateActivityAbilityHandler,
  UpdateActivityAbilityHandler,
  DeleteActivityAbilityHandler,
} from './handlers/activity.ability-handler';
import {
  ManageCommentAbilityHandler,
  ReadCommentAbilityHandler,
  CreateCommentAbilityHandler,
  UpdateCommentAbilityHandler,
  DeleteCommentAbilityHandler,
} from './handlers/comment.ability-handler';
import {
  ManageActivityTargetAbilityHandler,
  ReadActivityTargetAbilityHandler,
  CreateActivityTargetAbilityHandler,
  UpdateActivityTargetAbilityHandler,
  DeleteActivityTargetAbilityHandler,
} from './handlers/activity-target.ability-handler';
import {
  ManagePipelineAbilityHandler,
  ReadPipelineAbilityHandler,
  CreatePipelineAbilityHandler,
  UpdatePipelineAbilityHandler,
  DeletePipelineAbilityHandler,
} from './handlers/pipeline.ability-handler';
import {
  ManagePipelineStageAbilityHandler,
  ReadPipelineStageAbilityHandler,
  CreatePipelineStageAbilityHandler,
  UpdatePipelineStageAbilityHandler,
  DeletePipelineStageAbilityHandler,
} from './handlers/pipeline-stage.ability-handler';
import {
  ManagePipelineProgressAbilityHandler,
  ReadPipelineProgressAbilityHandler,
  CreatePipelineProgressAbilityHandler,
  UpdatePipelineProgressAbilityHandler,
  DeletePipelineProgressAbilityHandler,
} from './handlers/pipeline-progress.ability-handler';
import {
  CreateAttachmentAbilityHandler,
  DeleteAttachmentAbilityHandler,
  ManageAttachmentAbilityHandler,
  ReadAttachmentAbilityHandler,
  UpdateAttachmentAbilityHandler,
} from './handlers/attachment.ability-handler';
import {
  CreateViewFieldAbilityHandler,
  ReadViewFieldAbilityHandler,
  UpdateViewFieldAbilityHandler,
} from './handlers/view-field.ability-handler';
import {
  CreateFavoriteAbilityHandler,
  ReadFavoriteAbilityHandler
} from './handlers/favorite.ability-handler'

@Global()
@Module({
  providers: [
    AbilityFactory,
    PrismaService,
    // User
    ManageUserAbilityHandler,
    ReadUserAbilityHandler,
    CreateUserAbilityHandler,
    UpdateUserAbilityHandler,
    DeleteUserAbilityHandler,
    // Workspace
    ManageWorkspaceAbilityHandler,
    ReadWorkspaceAbilityHandler,
    CreateWorkspaceAbilityHandler,
    UpdateWorkspaceAbilityHandler,
    DeleteWorkspaceAbilityHandler,
    // Workspace Member
    ManageWorkspaceMemberAbilityHandler,
    ReadWorkspaceMemberAbilityHandler,
    CreateWorkspaceMemberAbilityHandler,
    UpdateWorkspaceMemberAbilityHandler,
    DeleteWorkspaceMemberAbilityHandler,
    // Company
    ManageCompanyAbilityHandler,
    ReadOneCompanyAbilityHandler,
    CreateCompanyAbilityHandler,
    UpdateCompanyAbilityHandler,
    DeleteCompanyAbilityHandler,
    // Person
    ManagePersonAbilityHandler,
    ReadPersonAbilityHandler,
    CreatePersonAbilityHandler,
    UpdatePersonAbilityHandler,
    DeletePersonAbilityHandler,
    // RefreshToken
    ManageRefreshTokenAbilityHandler,
    ReadRefreshTokenAbilityHandler,
    CreateRefreshTokenAbilityHandler,
    UpdateRefreshTokenAbilityHandler,
    DeleteRefreshTokenAbilityHandler,
    // Activity
    ManageActivityAbilityHandler,
    ReadActivityAbilityHandler,
    CreateActivityAbilityHandler,
    UpdateActivityAbilityHandler,
    DeleteActivityAbilityHandler,
    // Comment
    ManageCommentAbilityHandler,
    ReadCommentAbilityHandler,
    CreateCommentAbilityHandler,
    UpdateCommentAbilityHandler,
    DeleteCommentAbilityHandler,
    // ActivityTarget
    ManageActivityTargetAbilityHandler,
    ReadActivityTargetAbilityHandler,
    CreateActivityTargetAbilityHandler,
    UpdateActivityTargetAbilityHandler,
    DeleteActivityTargetAbilityHandler,
    //Attachment
    ManageAttachmentAbilityHandler,
    ReadAttachmentAbilityHandler,
    CreateAttachmentAbilityHandler,
    UpdateAttachmentAbilityHandler,
    DeleteAttachmentAbilityHandler,
    // Pipeline
    ManagePipelineAbilityHandler,
    ReadPipelineAbilityHandler,
    CreatePipelineAbilityHandler,
    UpdatePipelineAbilityHandler,
    DeletePipelineAbilityHandler,
    // PipelineStage
    ManagePipelineStageAbilityHandler,
    ReadPipelineStageAbilityHandler,
    CreatePipelineStageAbilityHandler,
    UpdatePipelineStageAbilityHandler,
    DeletePipelineStageAbilityHandler,
    // PipelineProgress
    ManagePipelineProgressAbilityHandler,
    ReadPipelineProgressAbilityHandler,
    CreatePipelineProgressAbilityHandler,
    UpdatePipelineProgressAbilityHandler,
    DeletePipelineProgressAbilityHandler,
    // ViewField
    ReadViewFieldAbilityHandler,
    CreateViewFieldAbilityHandler,
    UpdateViewFieldAbilityHandler,
    //Favorite
    ReadFavoriteAbilityHandler,
    CreateFavoriteAbilityHandler,
  ],
  exports: [
    AbilityFactory,
    // User
    ManageUserAbilityHandler,
    ReadUserAbilityHandler,
    CreateUserAbilityHandler,
    UpdateUserAbilityHandler,
    DeleteUserAbilityHandler,
    // Workspace
    ManageWorkspaceAbilityHandler,
    ReadWorkspaceAbilityHandler,
    CreateWorkspaceAbilityHandler,
    UpdateWorkspaceAbilityHandler,
    DeleteWorkspaceAbilityHandler,
    // Workspace Member
    ManageWorkspaceMemberAbilityHandler,
    ReadWorkspaceMemberAbilityHandler,
    CreateWorkspaceMemberAbilityHandler,
    UpdateWorkspaceMemberAbilityHandler,
    DeleteWorkspaceMemberAbilityHandler,
    // Company
    ManageCompanyAbilityHandler,
    ReadOneCompanyAbilityHandler,
    CreateCompanyAbilityHandler,
    UpdateCompanyAbilityHandler,
    DeleteCompanyAbilityHandler,
    // Person
    ManagePersonAbilityHandler,
    ReadPersonAbilityHandler,
    CreatePersonAbilityHandler,
    UpdatePersonAbilityHandler,
    DeletePersonAbilityHandler,
    // RefreshToken
    ManageRefreshTokenAbilityHandler,
    ReadRefreshTokenAbilityHandler,
    CreateRefreshTokenAbilityHandler,
    UpdateRefreshTokenAbilityHandler,
    DeleteRefreshTokenAbilityHandler,
    // Activity
    ManageActivityAbilityHandler,
    ReadActivityAbilityHandler,
    CreateActivityAbilityHandler,
    UpdateActivityAbilityHandler,
    DeleteActivityAbilityHandler,
    // Comment
    ManageCommentAbilityHandler,
    ReadCommentAbilityHandler,
    CreateCommentAbilityHandler,
    UpdateCommentAbilityHandler,
    DeleteCommentAbilityHandler,
    // ActivityTarget
    ManageActivityTargetAbilityHandler,
    ReadActivityTargetAbilityHandler,
    CreateActivityTargetAbilityHandler,
    UpdateActivityTargetAbilityHandler,
    DeleteActivityTargetAbilityHandler,
    //Attachment
    ManageAttachmentAbilityHandler,
    ReadAttachmentAbilityHandler,
    CreateAttachmentAbilityHandler,
    UpdateAttachmentAbilityHandler,
    DeleteAttachmentAbilityHandler,
    // Pipeline
    ManagePipelineAbilityHandler,
    ReadPipelineAbilityHandler,
    CreatePipelineAbilityHandler,
    UpdatePipelineAbilityHandler,
    DeletePipelineAbilityHandler,
    // PipelineStage
    ManagePipelineStageAbilityHandler,
    ReadPipelineStageAbilityHandler,
    CreatePipelineStageAbilityHandler,
    UpdatePipelineStageAbilityHandler,
    DeletePipelineStageAbilityHandler,
    // PipelineProgress
    ManagePipelineProgressAbilityHandler,
    ReadPipelineProgressAbilityHandler,
    CreatePipelineProgressAbilityHandler,
    UpdatePipelineProgressAbilityHandler,
    DeletePipelineProgressAbilityHandler,
    // ViewField
    ReadViewFieldAbilityHandler,
    CreateViewFieldAbilityHandler,
    UpdateViewFieldAbilityHandler,
    //Favorite
    ReadFavoriteAbilityHandler,
    CreateFavoriteAbilityHandler,
  ],
})
export class AbilityModule {}
