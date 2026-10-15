import { areArraysEqual } from '@base-ui/utils/areArraysEqual';
import { useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownRows } from './getDropdownRows';
import { getDropdownSearchTarget } from './getDropdownSearchTarget';
import { useDropdownContext } from './useDropdownContext';

type DropdownRowsEffectProps = {
  content: HTMLDivElement | null;
};

export const DropdownRowsEffect = ({ content }: DropdownRowsEffectProps) => {
  const { setRowIds, setSearchTargetId } = useDropdownContext();

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    const updateRows = () => {
      const rowIds = getDropdownRows(content).map((row) => row.id);

      setRowIds((currentRowIds) =>
        isDefined(currentRowIds) && areArraysEqual(currentRowIds, rowIds)
          ? currentRowIds
          : rowIds,
      );
      setSearchTargetId(getDropdownSearchTarget(content)?.id);
    };

    updateRows();

    const observer = new MutationObserver(updateRows);

    observer.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'id'],
    });

    return () => {
      observer.disconnect();
      setRowIds(undefined);
      setSearchTargetId(undefined);
    };
  }, [content, setRowIds, setSearchTargetId]);

  return null;
};
