import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { accessibleBy } from '@casl/prisma';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateWebHookAbilityHandler,
  DeleteWebHookAbilityHandler,
  ReadWebHookAbilityHandler,
} from 'src/ability/handlers/web-hook.ability-handler';
import { PrismaService } from 'src/database/prisma.service';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { CreateOneWebHookArgs } from 'src/core/@generated/web-hook/create-one-web-hook.args';
import { DeleteOneWebHookArgs } from 'src/core/@generated/web-hook/delete-one-web-hook.args';
import { FindManyWebHookArgs } from 'src/core/@generated/web-hook/find-many-web-hook.args';
import { WebHook } from 'src/core/@generated/web-hook/web-hook.model';

@UseGuards(JwtAuthGuard)
@Resolver(() => WebHook)
export class WebHookResolver {
  constructor(private readonly prismaService: PrismaService) {}
  @Mutation(() => WebHook)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateWebHookAbilityHandler)
  async createOneWebHook(
    @Args() args: CreateOneWebHookArgs,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<WebHook> {
    return this.prismaService.client.webHook.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspaceId } } },
      },
    });
  }

  @Mutation(() => WebHook, { nullable: false })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteWebHookAbilityHandler)
  async deleteOneWebHook(@Args() args: DeleteOneWebHookArgs): Promise<WebHook> {
    const hookToDelete = this.prismaService.client.webHook.findUnique({
      where: args.where,
    });
    if (!hookToDelete) {
      throw new NotFoundException();
    }
    return await this.prismaService.client.webHook.delete({
      where: args.where,
    });
  }

  @Query(() => [WebHook])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadWebHookAbilityHandler)
  async findManyWebHook(
    @Args() args: FindManyWebHookArgs,
    @UserAbility() ability: AppAbility,
  ) {
    const filterOptions = [accessibleBy(ability).WorkspaceMember];
    if (args.where) filterOptions.push(args.where);
    return this.prismaService.client.webHook.findMany({
      ...args,
      where: { AND: filterOptions },
    });
  }
}
