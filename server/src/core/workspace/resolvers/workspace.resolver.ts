import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { WorkspaceUpdateInput } from 'src/core/@generated/workspace/workspace-update.input';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { assert } from 'src/utils/assert';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  UpdateWorkspaceAbilityHandler,
  DeleteWorkspaceAbilityHandler,
} from 'src/ability/handlers/workspace.ability-handler';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from 'src/core/@generated/user/user.model';

@UseGuards(JwtAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Mutation(() => Workspace)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateWorkspaceAbilityHandler)
  async updateWorkspace(
    @Args('data') data: WorkspaceUpdateInput,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Workspace' })
    prismaSelect: PrismaSelect<'Workspace'>,
  ) {
    return this.workspaceService.update({
      where: {
        id: workspace.id,
      },
      data: {
        ...data,
      },
      select: prismaSelect.value,
    } as Prisma.WorkspaceUpdateArgs);
  }

  @Query(() => Workspace)
  async currentWorkspace(
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Workspace' })
    prismaSelect: PrismaSelect<'Workspace'>,
  ) {
    const selectedWorkspace = await this.workspaceService.findUnique({
      where: {
        id: workspace.id,
      },
      select: prismaSelect.value,
    });
    assert(selectedWorkspace, 'User not found');

    return selectedWorkspace;
  }

  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateWorkspaceAbilityHandler)
  @Mutation(() => String)
  async uploadWorkspaceLogo(
    @AuthWorkspace() workspace: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.WorkspaceLogo;

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
    });

    await this.workspaceService.update({
      where: { id: workspace.id },
      data: {
        logo: paths[0],
      },
    });

    return paths[0];
  }

  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteWorkspaceAbilityHandler)
  @Mutation(() => Workspace)
  async deleteCurrentWorkspace(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @PrismaSelector({ modelName: 'Workspace' })
    { value: select }: PrismaSelect<'Workspace'>,
    @AuthUser() { id: userId }: User,
  ) {
    return this.workspaceService.deleteWorkspace({
      workspaceId,
      select,
      userId,
    });
  }
}
