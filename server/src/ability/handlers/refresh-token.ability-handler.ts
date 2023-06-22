import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { subject } from '@casl/ability';
import { RefreshTokenWhereInput } from 'src/core/@generated/refresh-token/refresh-token-where.input';
import { GqlExecutionContext } from '@nestjs/graphql';
import { assert } from 'src/utils/assert';

class RefreshTokenArgs {
  where?: RefreshTokenWhereInput;
}

@Injectable()
export class ManageRefreshTokenAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'RefreshToken');
  }
}

@Injectable()
export class ReadRefreshTokenAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'RefreshToken');
  }
}

@Injectable()
export class CreateRefreshTokenAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'RefreshToken');
  }
}

@Injectable()
export class UpdateRefreshTokenAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<RefreshTokenArgs>();
    const refreshToken = await this.prismaService.refreshToken.findFirst({
      where: args.where,
    });
    assert(refreshToken, '', NotFoundException);

    return ability.can(
      AbilityAction.Update,
      subject('RefreshToken', refreshToken),
    );
  }
}

@Injectable()
export class DeleteRefreshTokenAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<RefreshTokenArgs>();
    const refreshToken = await this.prismaService.refreshToken.findFirst({
      where: args.where,
    });
    assert(refreshToken, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('RefreshToken', refreshToken),
    );
  }
}
