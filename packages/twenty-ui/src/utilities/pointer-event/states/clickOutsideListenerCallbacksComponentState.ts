import { createComponentState } from '../../state/component-state/utils/createComponentState';
import { ClickOutsideListenerCallback } from '../types/ClickOutsideListenerCallback';

export const clickOutsideListenerCallbacksComponentState = createComponentState<
  ClickOutsideListenerCallback[]
>({
  key: 'clickOutsideListenerCallbacksComponentState',
  defaultValue: [],
});
