import { createScopeInternalContext } from '../../../../utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '../../../../utilities/state/component-state/types/ComponentStateKey';

type SelectableListScopeInternalContextProps = ComponentStateKey;

export const SelectableListScopeInternalContext =
  createScopeInternalContext<SelectableListScopeInternalContextProps>();
