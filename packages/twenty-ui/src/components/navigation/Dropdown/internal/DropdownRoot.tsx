import { useCallback, useContext, useRef, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { preventDismissingClickActivation } from '@ui/utilities/utils/preventDismissingClickActivation';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRootProps } from '../types/DropdownRootProps';
import { type DropdownType } from '../types/DropdownType';
import { DropdownContext } from './DropdownContext';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { type DropdownPageFocusRequest } from './DropdownPageFocusRequest';
import { DropdownNestedRootEffect } from './DropdownNestedRootEffect';
import { getDropdownTabStopRowId } from './getDropdownTabStopRowId';
import { getTrailingFocusGuard } from './getTrailingFocusGuard';
import { isDropdownDismissPrevented } from './isDropdownDismissPrevented';
import { useRegisteredElementId } from './useRegisteredElementId';
import { useDropdownSelections } from './useDropdownSelections';
import { DropdownSelectionContext } from './DropdownSelectionContext';

type PageHistoryEntry = { id?: string; trigger?: DropdownFocusTarget };

export const DropdownRoot = ({
  children,
  type,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onEscapeKeyDown,
  onInteractOutside,
  multiple = false,
  defaultPage = 'root',
  isSubmenu = false,
}: DropdownRootProps & { isSubmenu?: boolean }) => {
  const parent = useContext(DropdownContext);
  const selectionState = useDropdownSelections();
  const { selections, initializeSelection, updateSelection } =
    isSubmenu && isDefined(parent) ? parent : selectionState;
  const openNestedRootCountRef = useRef(0);
  const registerOpenNestedRoot = useCallback(() => {
    openNestedRootCountRef.current += 1;

    return () => {
      openNestedRootCountRef.current -= 1;
    };
  }, []);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const [previousOpen, setPreviousOpen] = useState(open);
  const [pageHistory, setPageHistory] = useState<PageHistoryEntry[]>([
    { id: defaultPage },
  ]);
  const [activePage, setActivePage] = useState<{
    id: string;
    type: DropdownType;
  }>();
  const [rowIds, setRowIds] = useState<string[]>();
  const [focusedRowId, setFocusedRowId] = useState<string>();
  const pageId = pageHistory[pageHistory.length - 1]?.id;
  const [pageFocusRequest, setPageFocusRequest] =
    useState<DropdownPageFocusRequest>();
  const [initialFocusEdge, setInitialFocusEdge] = useState<'first' | 'last'>(
    'first',
  );
  const [focusOnOpen, setFocusOnOpen] = useState(true);
  const [searchTargetId, setSearchTargetId] = useState<string>();
  const [triggerId, registerTrigger] = useRegisteredElementId();
  const [titleId, registerTitle] = useRegisteredElementId();

  const isOpening = open && !previousOpen;
  const isClosing = !open && previousOpen;

  if (isOpening || isClosing) {
    setPreviousOpen(open);
  }

  if (isOpening) {
    setPageHistory([{ id: defaultPage }]);
    setActivePage(undefined);
    setPageFocusRequest(undefined);
    setFocusedRowId(undefined);
  }

  if (isClosing) {
    setInitialFocusEdge('first');
    setFocusOnOpen(true);
    setSearchTargetId(undefined);
  }

  const setOpen = (nextOpen: boolean) => {
    if (!isDefined(controlledOpen)) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const closeTree = (tabOutEvent?: Event) => {
    if (
      isDefined(tabOutEvent) &&
      isDropdownDismissPrevented({
        onDismiss: onInteractOutside,
        event: tabOutEvent,
        target: null,
      })
    ) {
      return;
    }

    setOpen(false);

    if (isSubmenu) {
      parent?.closeTree(tabOutEvent);
    }
  };

  const tabForwardOutOfTree = ({
    ownerDocument,
    tabOutEvent,
  }: {
    ownerDocument: Document;
    tabOutEvent: Event;
  }) => {
    const triggerElement = isDefined(triggerId)
      ? ownerDocument.getElementById(triggerId)
      : null;

    if (isSubmenu && isDefined(parent)) {
      setOpen(false);
      triggerElement?.focus();
      parent.tabForwardOutOfTree({ ownerDocument, tabOutEvent });
      return;
    }

    const trailingFocusGuard = getTrailingFocusGuard(triggerElement);

    if (!isDefined(trailingFocusGuard)) {
      closeTree(tabOutEvent);
      return;
    }

    trailingFocusGuard.focus();
  };

  const goToPage = ({
    id,
    trigger,
  }: {
    id: string;
    trigger?: DropdownFocusTarget;
  }) => {
    setPageFocusRequest({ pageId: id });
    setPageHistory((history) => [...history, { id, trigger }]);
  };

  const goBack = () => {
    const previousPage = pageHistory[pageHistory.length - 2];

    if (!isDefined(previousPage)) {
      return;
    }

    const trigger = pageHistory[pageHistory.length - 1]?.trigger;

    setPageFocusRequest({
      pageId: previousPage.id,
      target: trigger,
    });
    setPageHistory((history) => history.slice(0, -1));
  };

  const registerPage = useCallback(
    ({ id, type: pageType }: { id: string; type?: DropdownType }) => {
      if (!open) {
        return;
      }

      const resolvedType = pageType ?? type;

      setActivePage((previousPage) =>
        previousPage?.id === id && previousPage.type === resolvedType
          ? previousPage
          : { id, type: resolvedType },
      );
    },
    [open, type],
  );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && !open) {
          eventDetails.cancel();
          return;
        }

        const isOutsideDismissal =
          eventDetails.reason === 'outside-press' ||
          eventDetails.reason === 'focus-out';

        if (isOutsideDismissal && openNestedRootCountRef.current > 0) {
          eventDetails.cancel();
          return;
        }

        const isEscapeDismissPrevented =
          eventDetails.reason === 'escape-key' &&
          isDropdownDismissPrevented({
            onDismiss: onEscapeKeyDown,
            event: eventDetails.event,
          });
        const isOutsideDismissPrevented =
          isOutsideDismissal &&
          isDropdownDismissPrevented({
            onDismiss: onInteractOutside,
            event: eventDetails.event,
          });

        if (isEscapeDismissPrevented || isOutsideDismissPrevented) {
          eventDetails.cancel();
          return;
        }

        if (isOutsideDismissal) {
          preventDismissingClickActivation(eventDetails.event);
        }

        setFocusOnOpen(eventDetails.reason !== 'trigger-hover');
        setOpen(nextOpen);
      }}
    >
      <DropdownContext.Provider
        value={{
          type:
            isDefined(activePage) && activePage.id === pageId
              ? activePage.type
              : type,
          rootType: type,
          open,
          multiple,
          selections,
          initializeSelection,
          updateSelection,
          isSubmenu,
          parentType: parent?.type,
          rowFocus: {
            rowIds,
            tabStopRowId: getDropdownTabStopRowId({ rowIds, focusedRowId }),
            focusRow: setFocusedRowId,
          },
          parentRowFocus: parent?.rowFocus,
          setRowIds,
          pageId,
          pageFocusRequest,
          setPageFocusRequest,
          canGoBack: pageHistory.length > 1,
          initialFocusEdge,
          setInitialFocusEdge,
          focusOnOpen,
          setFocusOnOpen,
          setOpen,
          closeTree,
          tabForwardOutOfTree,
          goToPage,
          goBack,
          registerPage,
          registerOpenNestedRoot,
          searchTargetId,
          setSearchTargetId,
          triggerId,
          registerTrigger,
          titleId,
          registerTitle,
        }}
      >
        <DropdownNestedRootEffect
          open={open}
          registerOpenNestedRoot={
            isSubmenu ? undefined : parent?.registerOpenNestedRoot
          }
        />
        <DropdownSelectionContext.Provider value={undefined}>
          {children}
        </DropdownSelectionContext.Provider>
      </DropdownContext.Provider>
    </Popover.Root>
  );
};
