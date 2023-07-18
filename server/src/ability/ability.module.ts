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
  ReadCompanyAbilityHandler,
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
  ManageCommentThreadAbilityHandler,
  ReadCommentThreadAbilityHandler,
  CreateCommentThreadAbilityHandler,
  UpdateCommentThreadAbilityHandler,
  DeleteCommentThreadAbilityHandler,
} from './handlers/comment-thread.ability-handler';
import {
  ManageCommentAbilityHandler,
  ReadCommentAbilityHandler,
  CreateCommentAbilityHandler,
  UpdateCommentAbilityHandler,
  DeleteCommentAbilityHandler,
} from './handlers/comment.ability-handler';
import {
  ManageCommentThreadTargetAbilityHandler,
  ReadCommentThreadTargetAbilityHandler,
  CreateCommentThreadTargetAbilityHandler,
  UpdateCommentThreadTargetAbilityHandler,
  DeleteCommentThreadTargetAbilityHandler,
} from './handlers/comment-thread-target.ability-handler';
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
    ReadCompanyAbilityHandler,
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
    // CommentThread
    ManageCommentThreadAbilityHandler,
    ReadCommentThreadAbilityHandler,
    CreateCommentThreadAbilityHandler,
    UpdateCommentThreadAbilityHandler,
    DeleteCommentThreadAbilityHandler,
    // Comment
    ManageCommentAbilityHandler,
    ReadCommentAbilityHandler,
    CreateCommentAbilityHandler,
    UpdateCommentAbilityHandler,
    DeleteCommentAbilityHandler,
    // CommentThreadTarget
    ManageCommentThreadTargetAbilityHandler,
    ReadCommentThreadTargetAbilityHandler,
    CreateCommentThreadTargetAbilityHandler,
    UpdateCommentThreadTargetAbilityHandler,
    DeleteCommentThreadTargetAbilityHandler,
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
    ReadCompanyAbilityHandler,
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
    // CommentThread
    ManageCommentThreadAbilityHandler,
    ReadCommentThreadAbilityHandler,
    CreateCommentThreadAbilityHandler,
    UpdateCommentThreadAbilityHandler,
    DeleteCommentThreadAbilityHandler,
    // Comment
    ManageCommentAbilityHandler,
    ReadCommentAbilityHandler,
    CreateCommentAbilityHandler,
    UpdateCommentAbilityHandler,
    DeleteCommentAbilityHandler,
    // CommentThreadTarget
    ManageCommentThreadTargetAbilityHandler,
    ReadCommentThreadTargetAbilityHandler,
    CreateCommentThreadTargetAbilityHandler,
    UpdateCommentThreadTargetAbilityHandler,
    DeleteCommentThreadTargetAbilityHandler,
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
  ],
})
export class AbilityModule {}
