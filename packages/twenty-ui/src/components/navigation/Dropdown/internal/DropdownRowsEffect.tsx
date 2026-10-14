import { areArraysEqual } from '@base-ui/utils/areArraysEqual';
import {
  type Dispatch,
  type SetStateAction,
  useLayoutEffect,
  useState,
} from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownRowCollection } from './getDropdownRowCollection';
import { getDropdownSearchTarget } from './getDropdownSearchTarget';
import { useDropdownContext } from './useDropdownContext';

type DropdownRowsEffectProps = {
  content: HTMLDivElement | null;
  setRowIds: Dispatch<SetStateAction<string[] | undefined>>;
};

export const DropdownRowsEffect = ({
  content,
  setRowIds,
}: DropdownRowsEffectProps) => {
  const { type, rowRegistry, setSearchTargetId } = useDropdownContext();
  const [rowRegistryVersion, setRowRegistryVersion] = useState(0);

  useLayoutEffect(() => {
    const handleRowRegistryChange = () =>
      setRowRegistryVersion((version) => version + 1);

    rowRegistry.listeners.add(handleRowRegistryChange);

    return () => {
      rowRegistry.listeners.delete(handleRowRegistryChange);
    };
  }, [rowRegistry]);

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    const { search, enabledRows, rovingRows } =
      getDropdownRowCollection(rowRegistry);
    const rowIds = rovingRows.map((row) => row.id);

    setRowIds((currentRowIds) =>
      isDefined(currentRowIds) && areArraysEqual(currentRowIds, rowIds)
        ? currentRowIds
        : rowIds,
    );
    setSearchTargetId(
      getDropdownSearchTarget({ enabledRows, search, type })?.id,
    );
  }, [
    content,
    rowRegistry,
    rowRegistryVersion,
    type,
    setRowIds,
    setSearchTargetId,
  ]);

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    return () => {
      setRowIds(undefined);
      setSearchTargetId(undefined);
    };
  }, [content, setRowIds, setSearchTargetId]);

  return null;
};
