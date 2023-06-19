import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { PassportUser } from 'src/core/auth/strategies/jwt.auth.strategy';
import { CHECK_ABILITIES_KEY } from 'src/decorators/check-abilities.decorator';
import { AbilityFactory, AppAbility } from 'src/ability/ability.factory';
import {
  AbilityHandler,
  IAbilityHandler,
} from 'src/ability/interfaces/ability-handler.interface';
import { assert } from 'src/utils/assert';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlerTypes =
      this.reflector.get<Type<IAbilityHandler>[]>(
        CHECK_ABILITIES_KEY,
        context.getHandler(),
      ) || [];

    const request = getRequest(context);
    const passportUser = request?.user as PassportUser | null | undefined;

    assert(passportUser, '', UnauthorizedException);

    const ability = this.abilityFactory.defineAbility(
      passportUser.user,
      passportUser.workspace,
    );

    request.ability = ability;

    for (const handlerType of handlerTypes) {
      const handler = this.moduleRef.get(handlerType, { strict: false });

      if (!handler) {
        throw new Error(`Handler of type ${handlerType.name} not provided`);
      }

      const result = await this._execAbilityHandler(handler, ability);

      if (!result) {
        return false;
      }
    }

    return true;
  }

  private async _execAbilityHandler(
    handler: AbilityHandler,
    ability: AppAbility,
  ) {
    if (typeof handler === 'function') {
      return await handler(ability);
    }

    const res = await handler.handle(ability);

    return res;
  }
}
