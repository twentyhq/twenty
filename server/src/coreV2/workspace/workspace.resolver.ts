import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { assert } from 'src/utils/assert';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { DeleteWorkspaceAbilityHandler } from 'src/ability/handlers/workspace.ability-handler';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';

import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Query(() => Workspace)
  async currentWorkspace(@AuthWorkspace() { id }: Workspace) {
    const workspace = await this.workspaceService.findById(id);
    assert(workspace, 'User not found');
    return workspace;
  }

  @Mutation(() => String)
  async uploadWorkspaceLogo(
    @AuthWorkspace() { id }: Workspace,
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

    await this.workspaceService.updateOne(id, {
      logo: paths[0],
    });

    return paths[0];
  }

  @Mutation(() => Workspace)
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteWorkspaceAbilityHandler)
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: Workspace) {
    return this.workspaceService.deleteWorkspace(id);
  }
}
