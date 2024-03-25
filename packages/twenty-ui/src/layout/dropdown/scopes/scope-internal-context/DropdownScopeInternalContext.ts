import { createScopeInternalContext } from 'src/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from 'src/utilities/state/component-state/types/ComponentStateKey';

type DropdownScopeInternalContextProps = ComponentStateKey;

export const DropdownScopeInternalContext =
  createScopeInternalContext<DropdownScopeInternalContextProps>();
