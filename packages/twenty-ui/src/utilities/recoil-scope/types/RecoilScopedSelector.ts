import { RecoilValueReadOnly } from 'recoil';

import { ComponentStateKey } from '../../state/component-state/types/ComponentStateKey';

export type RecoilScopedSelector<StateType> = (
  scopedKey: ComponentStateKey,
) => RecoilValueReadOnly<StateType>;
