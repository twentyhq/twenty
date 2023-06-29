import { Args, Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';
import { UserService } from './user.service';
import { FindManyUserArgs } from 'src/core/@generated/user/find-many-user.args';
import { Workspace } from '@prisma/client';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User } from 'src/core/@generated/user/user.model';
import { ExceptionFilter } from 'src/filters/exception.filter';
import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadUserAbilityHandler } from 'src/ability/handlers/user.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { accessibleBy } from '@casl/prisma';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseFilters(ExceptionFilter)
  @Query(() => [User], {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadUserAbilityHandler)
  async findManyUser(
    @Args() args: FindManyUserArgs,
    @AuthWorkspace() workspace: Workspace,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'User' })
    prismaSelect: PrismaSelect<'User'>,
  ): Promise<Partial<User>[]> {
    return await this.userService.findMany({
      ...args,
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).User],
          }
        : accessibleBy(ability).User,
      select: prismaSelect.value,
    });
  }

  @ResolveField(() => String, {
    nullable: false,
  })
  displayName(@Parent() parent: User): string {
    // TODO: Should be removed when displayName is removed from the database
    if (!parent.firstName && !parent.lastName) {
      return parent.displayName ?? '';
    }

    return `${parent.firstName} ${parent.lastName}`;
  }
}
