import { SetMetadata, Type } from '@nestjs/common';
import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

export const CHECK_ABILITIES_KEY = 'check_abilities';
export const CheckAbilities = (...handlers: Type<IAbilityHandler>[]) =>
  SetMetadata(CHECK_ABILITIES_KEY, handlers);
