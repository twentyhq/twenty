import { createComponentState } from '../../state/component-state/utils/createComponentState';

export const clickOutsideListenerIsActivatedComponentState =
  createComponentState<boolean>({
    key: 'clickOutsideListenerIsActivatedComponentState',
    defaultValue: true,
  });
