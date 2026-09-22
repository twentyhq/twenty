import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useCallback, useContext, useRef, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRootProps } from '../types/DropdownRootProps';
import { type DropdownKind } from '../types/DropdownKind';
import { DropdownContext } from './DropdownContext';
import { type DropdownFocusTarget } from './DropdownFocusTarget';

type PageHistoryEntry = { id?: string; trigger?: DropdownFocusTarget };

export const DropdownRootProvider = ({
  children,
  kind,
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
  const [pageKinds, setPageKinds] = useState<Record<string, DropdownKind>>({});
  const [activeItemId, setActiveItemId] = useState<string>();
  const pageId = pageHistory[pageHistory.length - 1]?.id;
  const focusTargetRef = useRef<DropdownFocusTarget | undefined>(undefined);
  const initialFocusEdgeRef = useRef<'first' | 'last'>('first');
  const focusOnOpenRef = useRef(true);

  if (previousOpen !== open) {
    setPreviousOpen(open);

    if (!open) {
      setPageHistory([{ id: defaultPage }]);
      focusTargetRef.current = undefined;
      initialFocusEdgeRef.current = 'first';
      focusOnOpenRef.current = true;
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
    focusTargetRef.current = undefined;
    setPageHistory((history) => [...history, { id, trigger }]);
  };

  const goBack = () => {
    if (pageHistory.length < 2) {
      return;
    }

    focusTargetRef.current = pageHistory[pageHistory.length - 1]?.trigger;
    setPageHistory((history) => history.slice(0, -1));
  };

  const registerPage = useCallback(
    ({ id, kind: pageKind }: { id: string; kind?: DropdownKind }) => {
      const resolvedKind = pageKind ?? kind;

      setPageKinds((previousKinds) =>
        previousKinds[id] === resolvedKind
          ? previousKinds
          : { ...previousKinds, [id]: resolvedKind },
      );
    },
    [kind],
  );

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        focusOnOpenRef.current = eventDetails.reason !== 'trigger-hover';
        setOpen(nextOpen);
      }}
    >
      <DropdownContext.Provider
        value={{
          kind: isDefined(pageId) ? (pageKinds[pageId] ?? kind) : kind,
          open,
          multiple,
          isSubmenu,
          parentKind: parent?.kind,
          activeItemId,
          parentActiveItemId: parent?.activeItemId,
          setActiveItemId,
          setParentActiveItemId: parent?.setActiveItemId,
          pageId,
          canGoBack: pageHistory.length > 1,
          focusTargetRef,
          initialFocusEdgeRef,
          focusOnOpenRef,
          setOpen,
          closeTree,
          goToPage,
          goBack,
          registerPage,
        }}
      >
        {children}
      </DropdownContext.Provider>
    </PopoverPrimitive.Root>
  );
};
