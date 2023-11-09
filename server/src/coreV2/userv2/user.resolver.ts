import { Resolver, Query } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';

import { ExceptionFilter } from 'src/filters/exception.filter';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadUserAbilityHandler } from 'src/ability/handlers/user.ability-handler';

import { TUser } from './user.dto';
import { UserService } from './user.service';
import { User } from './user.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => TUser)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseFilters(ExceptionFilter)
  @Query(() => [TUser], {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadUserAbilityHandler)
  async findManyUserV2(): Promise<Partial<User>[]> {
    return this.userService.findAll();
  }
}
