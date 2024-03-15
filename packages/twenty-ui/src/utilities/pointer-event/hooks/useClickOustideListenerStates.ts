import { getScopeIdFromComponentId } from '../../recoil-scope/utils/getScopeIdFromComponentId';
import { extractComponentState } from '../../state/component-state/utils/extractComponentState';
import { clickOutsideListenerCallbacksComponentState } from '../states/clickOutsideListenerCallbacksComponentState';
import { clickOutsideListenerIsActivatedComponentState } from '../states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerIsMouseDownInsideComponentState } from '../states/clickOutsideListenerIsMouseDownInsideComponentState';
import { lockedListenerIdState } from '../states/lockedListenerIdState';

export const useClickOustideListenerStates = (componentId: string) => {
  const scopeId = getScopeIdFromComponentId(componentId);

  return {
    scopeId,
    getClickOutsideListenerCallbacksState: extractComponentState(
      clickOutsideListenerCallbacksComponentState,
      scopeId,
    ),
    getClickOutsideListenerIsMouseDownInsideState: extractComponentState(
      clickOutsideListenerIsMouseDownInsideComponentState,
      scopeId,
    ),
    getClickOutsideListenerIsActivatedState: extractComponentState(
      clickOutsideListenerIsActivatedComponentState,
      scopeId,
    ),
    lockedListenerIdState,
  };
};
