import { Resolver, Query } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';

import { ExceptionFilter } from 'src/filters/exception.filter';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadUserAbilityHandler } from 'src/ability/handlers/user.ability-handler';

import { UserV2Service } from './userv2.service';
import { UserV2 } from './userv2.entity';
import { TUserV2 } from './user.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => TUserV2)
export class UserV2Resolver {
  constructor(private readonly userService: UserV2Service) {}

  @UseFilters(ExceptionFilter)
  @Query(() => [TUserV2], {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadUserAbilityHandler)
  async findManyUserV2(): Promise<Partial<UserV2>[]> {
    return this.userService.findAll();
  }
}
