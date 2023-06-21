import { ExecutionContext, Type } from '@nestjs/common';
import { AppAbility } from '../ability.factory';

export interface IAbilityHandler {
  handle(
    ability: AppAbility,
    executionContext: ExecutionContext,
  ): Promise<boolean> | boolean;
}

export type AbilityHandler = Type<IAbilityHandler>;
