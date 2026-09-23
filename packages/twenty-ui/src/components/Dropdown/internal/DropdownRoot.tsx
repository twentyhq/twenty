import { useCallback, useContext, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRootProps } from '../types/DropdownRootProps';
import { type DropdownType } from '../types/DropdownType';
import { DropdownContext } from './DropdownContext';
import { type DropdownFocusTarget } from './DropdownFocusTarget';

type PageHistoryEntry = { id?: string; trigger?: DropdownFocusTarget };

export const DropdownRoot = ({
  children,
  type,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  multiple = false,
  defaultPage = 'root',
  isSubmenu = false,
}: DropdownRootProps & { isSubmenu?: boolean }) => {
  const parent = useContext(DropdownContext);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const [previousOpen, setPreviousOpen] = useState(open);
  const [pageHistory, setPageHistory] = useState<PageHistoryEntry[]>([
    { id: defaultPage },
  ]);
  const [pageTypes, setPageTypes] = useState<Record<string, DropdownType>>({});
  const [activeItemId, setActiveItemId] = useState<string>();
  const pageId = pageHistory[pageHistory.length - 1]?.id;
  const [focusTarget, setFocusTarget] = useState<DropdownFocusTarget>();
  const [initialFocusEdge, setInitialFocusEdge] = useState<'first' | 'last'>(
    'first',
  );
  const [focusOnOpen, setFocusOnOpen] = useState(true);

  if (previousOpen !== open) {
    setPreviousOpen(open);

    if (!open) {
      setPageHistory([{ id: defaultPage }]);
      setFocusTarget(undefined);
      setInitialFocusEdge('first');
      setFocusOnOpen(true);
    }
  }

  const setOpen = (nextOpen: boolean) => {
    if (!isDefined(controlledOpen)) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const closeTree = () => {
    setOpen(false);

    if (isSubmenu) {
      parent?.closeTree();
    }
  };

  const goToPage = ({
    id,
    trigger,
  }: {
    id: string;
    trigger: DropdownFocusTarget;
  }) => {
    setFocusTarget(undefined);
    setPageHistory((history) => [...history, { id, trigger }]);
  };

  const goBack = () => {
    if (pageHistory.length < 2) {
      return;
    }

    setFocusTarget(pageHistory[pageHistory.length - 1]?.trigger);
    setPageHistory((history) => history.slice(0, -1));
  };

  const registerPage = useCallback(
    ({ id, type: pageType }: { id: string; type?: DropdownType }) => {
      const resolvedType = pageType ?? type;

      setPageTypes((previousTypes) =>
        previousTypes[id] === resolvedType
          ? previousTypes
          : { ...previousTypes, [id]: resolvedType },
      );
    },
    [type],
  );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        setFocusOnOpen(eventDetails.reason !== 'trigger-hover');
        setOpen(nextOpen);
      }}
    >
      <DropdownContext.Provider
        value={{
          type: isDefined(pageId) ? (pageTypes[pageId] ?? type) : type,
          open,
          multiple,
          isSubmenu,
          parentType: parent?.type,
          activeItemId,
          parentActiveItemId: parent?.activeItemId,
          setActiveItemId,
          setParentActiveItemId: parent?.setActiveItemId,
          pageId,
          canGoBack: pageHistory.length > 1,
          focusTarget,
          initialFocusEdge,
          setInitialFocusEdge,
          focusOnOpen,
          setFocusOnOpen,
          setOpen,
          closeTree,
          goToPage,
          goBack,
          registerPage,
        }}
      >
        {children}
      </DropdownContext.Provider>
    </Popover.Root>
  );
};
