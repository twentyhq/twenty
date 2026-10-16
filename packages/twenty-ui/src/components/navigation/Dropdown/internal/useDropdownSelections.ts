import { useCallback, useState } from 'react';

import { type DropdownSelectionGroupState } from '../types/DropdownSelectionGroupState';

export const useDropdownSelections = () => {
  const [selections, setSelections] = useState(
    () => new Map<string, DropdownSelectionGroupState>(),
  );
  const initializeSelection = useCallback(
    ({ id, state }: { id: string; state: DropdownSelectionGroupState }) => {
      setSelections((currentSelections) => {
        if (currentSelections.get(id)?.multiple === state.multiple) {
          return currentSelections;
        }

        return new Map(currentSelections).set(id, state);
      });
    },
    [],
  );
  const updateSelection = useCallback(
    ({ id, state }: { id: string; state: DropdownSelectionGroupState }) => {
      setSelections((currentSelections) =>
        new Map(currentSelections).set(id, state),
      );
    },
    [],
  );

  return { selections, initializeSelection, updateSelection };
};
