import { SetMetadata } from '@nestjs/common';

import { AbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

export const CHECK_ABILITIES_KEY = 'check_abilities';
export const CheckAbilities = (...handlers: AbilityHandler[]) =>
  SetMetadata(CHECK_ABILITIES_KEY, handlers);
