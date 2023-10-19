import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from 'src/ability/ability.action';
import { AppAbility } from 'src/ability/ability.factory';
import { UserWhereInput } from 'src/core/@generated/user/user-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class UserArgs {
  where?: UserWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageUserAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'User');
  }
}

@Injectable()
export class ReadUserAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'User');
  }
}

@Injectable()
export class CreateUserAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'User',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'User');
  }
}

@Injectable()
export class UpdateUserAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<UserArgs>();
    // TODO: Confirm if this is correct
    const user = await this.prismaService.client.user.findFirst({
      where: args.where,
    });
    assert(user, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'User',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('User', user));
  }
}

@Injectable()
export class DeleteUserAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<UserArgs>();

    // obtain the auth user from the context
    const reqUser = gqlContext.getContext().req.user;

    // FIXME: When `args.where` is undefined(which it is in almost all the cases I've tested),
    // this query will return the first user entry in the DB, which is most likely not the current user
    const user = await this.prismaService.client.user.findFirst({
      where: { ...args.where, id: reqUser.user.id },
    });
    assert(user, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('User', user));
  }
}
