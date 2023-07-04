import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { FindManyUserArgs } from 'src/core/@generated/user/find-many-user.args';
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
import {
  ReadUserAbilityHandler,
  UpdateUserAbilityHandler,
} from 'src/ability/handlers/user.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { accessibleBy } from '@casl/prisma';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { assert } from 'src/utils/assert';
import { UpdateOneUserArgs } from '../@generated/user/update-one-user.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async currentUser(
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
      ...args,
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).User],
          }
        : accessibleBy(ability).User,
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
      ...args,
      select: prismaSelect.value,
    });
  }

  @ResolveField(() => String, {
    nullable: false,
  })
  displayName(@Parent() parent: User): string {
    return `${parent.firstName ?? ''} ${parent.lastName ?? ''}`;
  }
}
