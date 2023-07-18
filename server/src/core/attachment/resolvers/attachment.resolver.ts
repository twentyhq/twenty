import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { User, Workspace } from '@prisma/client';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { v4 as uuidV4 } from 'uuid';
import { AttachmentService } from '../services/attachment.service';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

@Resolver()
export class AttachmentResolver {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @Mutation(() => String)
  async uploadAttachment(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('activityId') activityId: string,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const { path } = await this.fileUploadService.uploadFile({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder: FileFolder.Attachment,
    });

    await this.attachmentService.create({
      data: {
        id: uuidV4(),
        fullPath: path,
        type: this.attachmentService.getFileTypeFromFileName(filename),
        name: filename,
        activityId: activityId,
        authorId: user.id,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        fullPath: true,
      },
    });

    return path;
  }
}
