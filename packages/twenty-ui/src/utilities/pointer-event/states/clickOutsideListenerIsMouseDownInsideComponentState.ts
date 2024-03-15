import { createComponentState } from '../../state/component-state/utils/createComponentState';

export const clickOutsideListenerIsMouseDownInsideComponentState =
  createComponentState<boolean>({
    key: 'clickOutsideListenerIsMouseDownInsideComponentState',
    defaultValue: false,
  });
