import { useContext } from 'react';

import { type DropdownRow } from './DropdownRow';
import { DropdownRowScopeContext } from './DropdownRowScopeContext';
import { useDropdownContext } from './useDropdownContext';

export const useDropdownRow = ({
  id,
  kind,
  disabled,
}: Pick<DropdownRow, 'id' | 'kind' | 'disabled'>) => {
  const { type, parentType } = useDropdownContext();
  const rowScope = useContext(DropdownRowScopeContext);
  const rowType = kind === 'submenu-trigger' ? parentType : type;
  const isRovingRow =
    rowType !== 'panel' && (rowScope?.rowIds?.includes(id) ?? true);
  const isOutsideTabOrder =
    disabled || (isRovingRow && rowScope?.tabStopRowId !== id);

  return {
    tabIndex: isOutsideTabOrder ? -1 : 0,
    registry: rowScope?.registry,
  };
};
