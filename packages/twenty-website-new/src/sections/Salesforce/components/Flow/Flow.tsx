'use client';

import { Body, Heading } from '@/design-system/components';
import type {
  SalesforceAddonRowType,
  SalesforceDataType,
  SalesforceWrongChoicePopupType,
} from '@/sections/Salesforce/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useCallback, useRef, useState } from 'react';
import { PricingWindow } from '../PricingWindow/PricingWindow';
import { Root } from '../Root/Root';
import {
  WrongChoicePopup,
  WRONG_CHOICE_POPUP_WIDTH,
} from '../WrongChoicePopup/WrongChoicePopup';

const CopyColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  max-width: 400px;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-self: center;
  }
`;

const RightColumn = styled.div`
  max-width: 672px;
  min-width: 0;
  position: relative;
  width: 100%;
`;

type OpenWrongChoicePopup = {
  body: string;
  key: string;
  layerIndex: number;
  left: number;
  sourceId: string;
  top: number;
  titleBar: string;
};

const POPUP_MARGIN = 12;
const POPUP_X_OFFSET = 32;
const POPUP_Y_OFFSET = 12;
const POPUP_STACK_OFFSET = 14;

const getPopupPosition = (
  anchorRect: DOMRect | null,
  containerRect: DOMRect | null,
  stackIndex = 0,
) => {
  if (!anchorRect || !containerRect) {
    return {
      left: 24 + stackIndex * POPUP_STACK_OFFSET,
      top: 120 + stackIndex * POPUP_STACK_OFFSET,
    };
  }

  const maxLeft = Math.max(
    POPUP_MARGIN,
    containerRect.width - WRONG_CHOICE_POPUP_WIDTH - POPUP_MARGIN,
  );

  return {
    left: Math.min(
      Math.max(
        anchorRect.left -
          containerRect.left +
          POPUP_X_OFFSET +
          stackIndex * POPUP_STACK_OFFSET,
        POPUP_MARGIN,
      ),
      maxLeft,
    ),
    top: Math.max(
      anchorRect.top -
        containerRect.top -
        POPUP_Y_OFFSET +
        stackIndex * POPUP_STACK_OFFSET,
      POPUP_MARGIN,
    ),
  };
};

type FlowProps = SalesforceDataType & {
  backgroundColor: string;
};

export function Flow({ backgroundColor, body, heading, pricing }: FlowProps) {
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const popupSequenceRef = useRef(0);
  const [isPricingWindowVisible, setIsPricingWindowVisible] = useState(true);
  const [checkedIds, setCheckedIds] = useState(() => {
    const initial = new Set<string>();
    for (const row of pricing.addons) {
      if (row.defaultChecked) {
        initial.add(row.id);
      }
    }
    return initial;
  });

  const [popups, setPopups] = useState<OpenWrongChoicePopup[]>([]);

  const openPopup = useCallback(
    (
      sourceId: string,
      popup: SalesforceWrongChoicePopupType,
      anchorRect: DOMRect | null,
    ) => {
      const popupSequence = popupSequenceRef.current;
      popupSequenceRef.current += 1;

      setPopups((previous) => {
        const popupCountForSource = previous.filter(
          (entry) => entry.sourceId === sourceId,
        ).length;
        const popupPosition = getPopupPosition(
          anchorRect,
          rightColumnRef.current?.getBoundingClientRect() ?? null,
          popupCountForSource,
        );

        return [
          ...previous,
          {
            body: popup.body,
            key: `${sourceId}-${popupSequence}`,
            layerIndex: popupSequence,
            left: popupPosition.left,
            sourceId,
            top: popupPosition.top,
            titleBar: popup.titleBar,
          },
        ];
      });
    },
    [],
  );

  const handleAddonToggle = useCallback(
    (addon: SalesforceAddonRowType, anchorRect: DOMRect | null) => {
      if (addon.disabled) {
        return;
      }

      setCheckedIds((previous) => {
        const next = new Set(previous);
        if (next.has(addon.id)) {
          next.delete(addon.id);
        } else {
          next.add(addon.id);
        }
        return next;
      });

      openPopup(addon.id, addon.popup, anchorRect);
    },
    [openPopup],
  );

  const handleClosePopup = useCallback((key: string) => {
    setPopups((previous) => previous.filter((popup) => popup.key !== key));
  }, []);

  const handleClosePricingWindow = useCallback(() => {
    setIsPricingWindowVisible(false);
    setPopups([]);
  }, []);

  return (
    <Root backgroundColor={backgroundColor}>
      <CopyColumn>
        <Heading as="h2" segments={heading} size="xl" weight="light" />
        <Body body={body} family="sans" size="md" weight="regular" />
      </CopyColumn>
      <RightColumn ref={rightColumnRef}>
        {isPricingWindowVisible ? (
          <PricingWindow
            checkedIds={checkedIds}
            onAddonToggle={handleAddonToggle}
            onClose={handleClosePricingWindow}
            pricing={pricing}
          />
        ) : null}
        {isPricingWindowVisible
          ? popups.map((popup) => (
              <WrongChoicePopup
                body={popup.body}
                key={popup.key}
                layerIndex={popup.layerIndex}
                left={popup.left}
                onClose={() => {
                  handleClosePopup(popup.key);
                }}
                top={popup.top}
                titleBar={popup.titleBar}
                titleId={`sf-wrong-choice-${popup.key}`}
              />
            ))
          : null}
      </RightColumn>
    </Root>
  );
}
