import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { PassportUser } from 'src/core/auth/strategies/jwt.auth.strategy';
import { CHECK_ABILITIES_KEY } from 'src/decorators/check-abilities.decorator';
import { AbilityFactory, AppAbility } from 'src/ability/ability.factory';
import { AbilityHandler } from 'src/ability/interfaces/ability-handler.interface';
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
    const handlers =
      this.reflector.get<AbilityHandler[]>(
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

    for (const handler of handlers) {
      const result = await this._execAbilityHandler(handler, ability, context);

      if (!result) {
        return false;
      }
    }

    return true;
  }

  private async _execAbilityHandler(
    abilityHandler: AbilityHandler,
    ability: AppAbility,
    context: ExecutionContext,
  ) {
    const handler = this.moduleRef.get(abilityHandler, { strict: false });

    if (!handler) {
      throw new Error(`Handler of type ${abilityHandler.name} not provided`);
    }

    const res = await handler.handle(ability, context);

    return res;
  }
}
