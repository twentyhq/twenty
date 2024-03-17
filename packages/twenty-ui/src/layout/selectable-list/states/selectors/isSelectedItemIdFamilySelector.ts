import { createComponentFamilySelector } from '../../../../utilities/state/component-state/utils/createComponentFamilySelector';
import { isSelectedItemIdComponentFamilyState } from '../isSelectedItemIdComponentFamilyState';

export const isSelectedItemIdFamilySelector = createComponentFamilySelector<
  boolean,
  string
>({
  key: 'isSelectedItemIdFamilySelector',
  get:
    ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
    ({ get }) =>
      get(
        isSelectedItemIdComponentFamilyState({
          scopeId: scopeId,
          familyKey: familyKey,
        }),
      ),
  set:
    ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
    ({ set }, newValue) =>
      set(
        isSelectedItemIdComponentFamilyState({
          scopeId: scopeId,
          familyKey: familyKey,
        }),
        newValue,
      ),
});
