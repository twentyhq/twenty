'use client';

import { Body, Heading } from '@/design-system/components';
import { SALESFORCE_POPUPS } from '@/sections/Salesforce/constants';
import type {
  SalesforceAddonRowType,
  SalesforceDataType,
} from '@/sections/Salesforce/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';
import { PricingWindow } from '../PricingWindow/PricingWindow';
import { Root } from '../Root/Root';
import { WrongChoicePopup } from '../WrongChoicePopup/WrongChoicePopup';

const CopyColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  max-width: 400px;
  min-width: 0;
`;

const RightColumn = styled.div`
  max-width: 672px;
  min-width: 0;
  position: relative;
  width: 100%;
`;

type OpenWrongChoicePopup = {
  addonId: string;
  body: string;
  key: string;
  stackIndex: number;
  titleBar: string;
};

const reindexPopups = (
  list: OpenWrongChoicePopup[],
): OpenWrongChoicePopup[] =>
  list.map((popup, index) => ({ ...popup, stackIndex: index }));

type FlowProps = SalesforceDataType & {
  backgroundColor: string;
};

export function Flow({ backgroundColor, body, heading, pricing }: FlowProps) {
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

  const handleAddonToggle = useCallback(
    (addon: SalesforceAddonRowType) => {
      if (addon.disabled) {
        return;
      }

      const popupTemplate = SALESFORCE_POPUPS[addon.popupKey];
      if (!popupTemplate) {
        return;
      }

      const wasChecked = checkedIds.has(addon.id);

      setCheckedIds((previous) => {
        const next = new Set(previous);
        if (wasChecked) {
          next.delete(addon.id);
        } else {
          next.add(addon.id);
        }
        return next;
      });

      if (wasChecked) {
        setPopups((previous) =>
          reindexPopups(
            previous.filter((popup) => popup.addonId !== addon.id),
          ),
        );
      } else {
        setPopups((previous) => [
          ...previous,
          {
            addonId: addon.id,
            body: popupTemplate.body,
            key: `${addon.id}-${Date.now()}`,
            stackIndex: previous.length,
            titleBar: popupTemplate.titleBar,
          },
        ]);
      }
    },
    [checkedIds],
  );

  const handleClosePopup = useCallback((key: string) => {
    setPopups((previous) =>
      reindexPopups(previous.filter((popup) => popup.key !== key)),
    );
  }, []);

  return (
    <Root backgroundColor={backgroundColor}>
      <CopyColumn>
        <Heading as="h2" segments={heading} size="xl" weight="light" />
        <Body body={body} family="sans" size="md" weight="regular" />
      </CopyColumn>
      <RightColumn>
        <PricingWindow
          checkedIds={checkedIds}
          onAddonToggle={handleAddonToggle}
          pricing={pricing}
        />
        {popups.map((popup) => (
          <WrongChoicePopup
            body={popup.body}
            key={popup.key}
            onClose={() => {
              handleClosePopup(popup.key);
            }}
            stackIndex={popup.stackIndex}
            titleBar={popup.titleBar}
            titleId={`sf-wrong-choice-${popup.key}`}
          />
        ))}
      </RightColumn>
    </Root>
  );
}
