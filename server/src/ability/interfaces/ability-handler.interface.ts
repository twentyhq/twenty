import { AppAbility } from '../ability.factory';

export interface IAbilityHandler {
  handle(ability: AppAbility): Promise<boolean> | boolean;
}
type AbilityHandlerCallback = (
  ability: AppAbility,
) => Promise<boolean> | boolean;

export type AbilityHandler = IAbilityHandler | AbilityHandlerCallback;
