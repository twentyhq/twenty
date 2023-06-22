import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assert } from 'src/utils/assert';
import { UserWhereInput } from 'src/core/@generated/user/user-where.input';
import { GqlExecutionContext } from '@nestjs/graphql';
import { subject } from '@casl/ability';

class UserArgs {
  where?: UserWhereInput;
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
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'User');
  }
}

@Injectable()
export class UpdateUserAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<UserArgs>();
    const user = await this.prismaService.user.findFirst({
      where: args.where,
    });
    assert(user, '', NotFoundException);

    return ability.can(AbilityAction.Update, subject('User', user));
  }
}

@Injectable()
export class DeleteUserAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<UserArgs>();
    const user = await this.prismaService.user.findFirst({
      where: args.where,
    });
    assert(user, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('User', user));
  }
}
