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
import { subscribeToDropdownRegistry } from './subscribeToDropdownRegistry';
import { useDropdownContext } from './useDropdownContext';

type DropdownRowsEffectProps = {
  content: HTMLDivElement | null;
  setRowIds: Dispatch<SetStateAction<string[] | undefined>>;
};

export const DropdownRowsEffect = ({
  content,
  setRowIds,
}: DropdownRowsEffectProps) => {
  const { type, registry, setSearchTargetId } = useDropdownContext();
  const [registryVersion, setRegistryVersion] = useState(0);

  useLayoutEffect(
    () =>
      subscribeToDropdownRegistry({
        registry,
        listener: () => setRegistryVersion((version) => version + 1),
      }),
    [registry],
  );

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    const { search, enabledRows, rovingRows } =
      getDropdownRowCollection(registry);
    const rowIds = rovingRows.map((row) => row.id);

    setRowIds((currentRowIds) =>
      isDefined(currentRowIds) && areArraysEqual(currentRowIds, rowIds)
        ? currentRowIds
        : rowIds,
    );
    setSearchTargetId(
      getDropdownSearchTarget({ enabledRows, search, type })?.id,
    );
  }, [content, registry, registryVersion, type, setRowIds, setSearchTargetId]);

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
