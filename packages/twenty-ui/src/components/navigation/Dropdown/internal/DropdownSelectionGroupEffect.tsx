import { useLayoutEffect } from 'react';

import { type DropdownSelectionGroupState } from '../types/DropdownSelectionGroupState';

type DropdownSelectionGroupEffectProps = {
  id: string;
  initialState: DropdownSelectionGroupState;
  initializeSelection: (selection: {
    id: string;
    state: DropdownSelectionGroupState;
  }) => void;
};

export const DropdownSelectionGroupEffect = ({
  id,
  initialState,
  initializeSelection,
}: DropdownSelectionGroupEffectProps) => {
  useLayoutEffect(() => {
    initializeSelection({ id, state: initialState });
  }, [id, initialState, initializeSelection]);

  return null;
};
