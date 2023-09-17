import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';

import crypto from 'crypto';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';
import { SupportDriver } from 'src/integrations/environment/interfaces/support.interface';

import { FindManyUserArgs } from 'src/core/@generated/user/find-many-user.args';
import { User } from 'src/core/@generated/user/user.model';
import { ExceptionFilter } from 'src/filters/exception.filter';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  DeleteUserAbilityHandler,
  ReadUserAbilityHandler,
  UpdateUserAbilityHandler,
} from 'src/ability/handlers/user.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { assert } from 'src/utils/assert';
import { UpdateOneUserArgs } from 'src/core/@generated/user/update-one-user.args';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { UserService } from './user.service';

const getHMACKey = (email?: string, key?: string | null) => {
  if (!email || !key) return null;

  const hmac = crypto.createHmac('sha256', key);
  return hmac.update(email).digest('hex');
};

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
    private environmentService: EnvironmentService,
  ) {}

  @Query(() => User)
  async currentUser(
    @AuthUser() { id }: User,
    @PrismaSelector({ modelName: 'User' })
    prismaSelect: PrismaSelect<'User'>,
  ) {
    const select = prismaSelect.value;

    const user = await this.userService.findUnique({
      where: {
        id,
      },
      select,
    });
    assert(user, 'User not found');

    return user;
  }

  @UseFilters(ExceptionFilter)
  @Query(() => [User], {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadUserAbilityHandler)
  async findManyUser(
    @Args() args: FindManyUserArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'User' })
    prismaSelect: PrismaSelect<'User'>,
  ): Promise<Partial<User>[]> {
    return await this.userService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).User],
          }
        : accessibleBy(ability).User,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => User)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateUserAbilityHandler)
  async updateUser(
    @Args() args: UpdateOneUserArgs,
    @AuthUser() { id }: User,
    @PrismaSelector({ modelName: 'User' })
    prismaSelect: PrismaSelect<'User'>,
  ) {
    const user = await this.userService.findUnique({
      where: {
        id,
      },
      select: prismaSelect.value,
    });
    assert(user, 'User not found');

    return this.userService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.UserUpdateArgs);
  }

  @ResolveField(() => String, {
    nullable: false,
  })
  displayName(@Parent() parent: User): string {
    return `${parent.firstName ?? ''} ${parent.lastName ?? ''}`;
  }

  @ResolveField(() => String, {
    nullable: true,
  })
  supportUserHash(@Parent() parent: User): string | null {
    if (this.environmentService.getSupportDriver() !== SupportDriver.Front) {
      return null;
    }
    const key = this.environmentService.getSupportFrontHMACKey();
    return getHMACKey(parent.email, key);
  }

  @Mutation(() => String)
  async uploadProfilePicture(
    @AuthUser() { id }: User,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.ProfilePicture;

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
    });

    await this.userService.update({
      where: { id },
      data: {
        avatarUrl: paths[0],
      },
    });

    return paths[0];
  }

  @Mutation(() => User)
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteUserAbilityHandler)
  async deleteUserAccount(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.userService.deleteUser({ userId, workspaceId });
  }
}
