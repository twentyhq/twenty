import { RecoilState } from 'recoil';

import { ComponentStateKey } from '../../state/component-state/types/ComponentStateKey';

export type RecoilScopedState<StateType> = (
  scopedKey: ComponentStateKey,
) => RecoilState<StateType>;
