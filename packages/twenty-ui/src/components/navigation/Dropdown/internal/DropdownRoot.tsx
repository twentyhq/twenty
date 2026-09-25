import { useCallback, useContext, useState } from 'react';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRootProps } from '../types/DropdownRootProps';
import { type DropdownType } from '../types/DropdownType';
import { DropdownContext } from './DropdownContext';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { type DropdownPageFocusRequest } from './DropdownPageFocusRequest';
import { preventDismissingClickActivation } from './preventDismissingClickActivation';

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
  const [activePage, setActivePage] = useState<{
    id: string;
    type: DropdownType;
  }>();
  const [activeItemId, setActiveItemId] = useState<string>();
  const pageId = pageHistory[pageHistory.length - 1]?.id;
  const [pageFocusRequest, setPageFocusRequest] =
    useState<DropdownPageFocusRequest>();
  const [initialFocusEdge, setInitialFocusEdge] = useState<'first' | 'last'>(
    'first',
  );
  const [focusOnOpen, setFocusOnOpen] = useState(true);

  if (previousOpen !== open) {
    setPreviousOpen(open);

    if (!open) {
      setPageHistory([{ id: defaultPage }]);
      setActivePage(undefined);
      setPageFocusRequest(undefined);
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
        if (
          eventDetails.reason === 'outside-press' ||
          eventDetails.reason === 'focus-out'
        ) {
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
          isSubmenu,
          parentType: parent?.type,
          activeItemId,
          parentActiveItemId: parent?.activeItemId,
          setActiveItemId,
          setParentActiveItemId: parent?.setActiveItemId,
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
