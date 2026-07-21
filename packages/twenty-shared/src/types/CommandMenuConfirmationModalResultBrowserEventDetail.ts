import { type CommandMenuConfirmationModalResult } from './CommandMenuConfirmationModalResult';
import { type ConfirmationModalCaller } from './ConfirmationModalCaller';

export type CommandMenuConfirmationModalResultBrowserEventDetail = {
  caller: ConfirmationModalCaller;
  confirmationResult: CommandMenuConfirmationModalResult;
};
