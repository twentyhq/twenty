import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { CommentThread } from '../../../core/@generated/comment-thread/comment-thread.model';
import { CreateOneCommentThreadArgs } from '../../../core/@generated/comment-thread/create-one-comment-thread.args';
import { CreateOneCommentThreadGuard } from '../../../guards/create-one-comment-thread.guard';
import { FindManyCommentThreadArgs } from '../../../core/@generated/comment-thread/find-many-comment-thread.args';
import { CommentThreadService } from '../services/comment-thread.service';
import { UpdateOneCommentThreadArgs } from 'src/core/@generated/comment-thread/update-one-comment-thread.args';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateCommentThreadAbilityHandler,
  DeleteCommentThreadAbilityHandler,
  ReadCommentThreadAbilityHandler,
  UpdateCommentThreadAbilityHandler,
} from 'src/ability/handlers/comment-thread.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { accessibleBy } from '@casl/prisma';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { DeleteManyCommentThreadArgs } from 'src/core/@generated/comment-thread/delete-many-comment-thread.args';
import { Prisma, User } from '@prisma/client';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';
import { v4 } from 'uuid';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { getAttachmentTypeFromFileName } from 'src/core/file/file.utils';
import { AttachmentService } from 'src/core/file/services/attachment.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => CommentThread)
export class CommentThreadResolver {
  constructor(
    private readonly commentThreadService: CommentThreadService,
    private readonly fileUploadService: FileUploadService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @UseGuards(CreateOneCommentThreadGuard)
  @Mutation(() => CommentThread, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateCommentThreadAbilityHandler)
  async createOneCommentThread(
    @Args() args: CreateOneCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>> {
    const createdCommentThread = await this.commentThreadService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select: prismaSelect.value,
    } as Prisma.CommentThreadCreateArgs);

    return createdCommentThread;
  }

  @Mutation(() => CommentThread, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateCommentThreadAbilityHandler)
  async updateOneCommentThread(
    @Args() args: UpdateOneCommentThreadArgs,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>> {
    // TODO: Do a proper check with recursion testing on args in a more generic place
    for (const key in args.data) {
      if (args.data[key]) {
        for (const subKey in args.data[key]) {
          if (JSON.stringify(args.data[key][subKey]) === '{}') {
            delete args.data[key][subKey];
          }
        }
      }

      if (JSON.stringify(args.data[key]) === '{}') {
        delete args.data[key];
      }
    }
    const updatedCommentThread = await this.commentThreadService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.CommentThreadUpdateArgs);

    return updatedCommentThread;
  }

  @Query(() => [CommentThread])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadCommentThreadAbilityHandler)
  async findManyCommentThreads(
    @Args() args: FindManyCommentThreadArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>[]> {
    const result = await this.commentThreadService.findMany({
      where: {
        ...args.where,
        AND: [accessibleBy(ability).CommentThread],
      },
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });

    return result;
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteCommentThreadAbilityHandler)
  async deleteManyCommentThreads(
    @Args() args: DeleteManyCommentThreadArgs,
  ): Promise<AffectedRows> {
    return this.commentThreadService.deleteMany({
      where: args.where,
    });
  }

  @Mutation(() => String)
  async uploadActivityAttachment(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('activityId') activityId: string,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.Attachment;
    const fileId = v4();

    console.log(mimetype);
    console.log(getAttachmentTypeFromFileName(mimetype));

    const { path } = await this.fileUploadService.uploadFile({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      fileId,
    });

    await this.attachmentService.create({
      data: {
        id: fileId,
        fullPath: path,
        type: getAttachmentTypeFromFileName(filename),
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
