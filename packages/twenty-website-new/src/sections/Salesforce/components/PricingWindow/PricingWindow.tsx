'use client';

import type {
  SalesforceAddonRowType,
  SalesforcePricingPanelType,
} from '@/sections/Salesforce/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Panel = styled.div`
  background-color: rgba(28, 28, 28, 0.2);
  display: flex;
  flex-direction: column;
  max-width: 672px;
  padding: 3px;
  position: relative;
  width: 100%;
`;

const TitleBar = styled.div`
  align-items: center;
  background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 3px 3px;
  width: 100%;
`;

const TitleBarText = styled.p`
  color: ${theme.colors.secondary.background[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(4)};
  line-height: 12px;
  margin: 0;
`;

const WindowChrome = styled.div`
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #dfdfdf,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #ffffff;
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

const ContentPad = styled.div`
  padding: ${theme.spacing(2.75)};
  width: 100%;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  overflow: clip;
  padding: ${theme.spacing(4)};
  width: 100%;
`;

const ProductBlock = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${theme.font.family.mono};
  gap: ${theme.spacing(4)};
  max-width: 427px;
`;

const ProductTitle = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(14.5)};
  line-height: ${theme.spacing(14)};
  margin: 0;
`;

const PriceRow = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1)};
  white-space: nowrap;
`;

const PriceAmount = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(12.75)};
  line-height: ${theme.spacing(10)};
`;

const PriceSuffix = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
`;

const FakeButton = styled.div`
  align-items: center;
  background-color: rgba(28, 28, 28, 0.2);
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  color: ${theme.colors.primary.text[100]};
  display: flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(4)};
  justify-content: center;
  line-height: ${theme.spacing(4)};
  min-height: ${theme.spacing(10)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(4.5)};
  text-transform: uppercase;
  width: 100%;
`;

const SectionLabel = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.spacing(6)};
  margin: 0;
`;

const AddonRow = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing(4)};
  width: 100%;
`;

const CheckboxLabel = styled.label<{ disabled?: boolean }>`
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex: 1;
  gap: ${theme.spacing(2)};
  min-width: 0;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

const HiddenCheckbox = styled.input`
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
`;

const CheckboxFace = styled.span<{ checked: boolean }>`
  background-color: ${({ checked }) =>
    checked ? theme.colors.secondary.background[100] : 'rgba(255, 255, 255, 0.05)'};
  box-shadow:
    inset -1.5px -1.5px 0 0 #ffffff,
    inset 1.5px 1.5px 0 0 #808080,
    inset -3px -3px 0 0 #dfdfdf,
    inset 3px 3px 0 0 #0a0a0a;
  flex-shrink: 0;
  height: ${theme.spacing(5)};
  position: relative;
  width: ${theme.spacing(5)};
`;

const CheckGlyph = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  left: 50%;
  line-height: 1;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -58%);
`;

const AddonLabelText = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  white-space: nowrap;
`;

const AddonRightText = styled.span`
  color: ${theme.colors.primary.text[100]};
  flex-shrink: 0;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  text-align: right;
  white-space: nowrap;
`;

export type PricingWindowProps = {
  checkedIds: ReadonlySet<string>;
  onAddonToggle: (addon: SalesforceAddonRowType) => void;
  pricing: SalesforcePricingPanelType;
};

export function PricingWindow({
  checkedIds,
  onAddonToggle,
  pricing,
}: PricingWindowProps) {
  return (
    <Panel>
      <WindowChrome aria-hidden="true" />
      <TitleBar>
        <TitleBarText>{pricing.windowTitle}</TitleBarText>
      </TitleBar>
      <ContentPad>
        <Inner>
          <ProductBlock>
            <ProductTitle>{pricing.productTitle}</ProductTitle>
            <PriceRow>
              <PriceAmount>{pricing.priceAmount}</PriceAmount>
              <PriceSuffix>{pricing.priceSuffix}</PriceSuffix>
            </PriceRow>
          </ProductBlock>
          <FakeButton>{pricing.primaryCtaLabel}</FakeButton>
          <SectionLabel>{pricing.featureSectionHeading}</SectionLabel>
          {pricing.addons.map((addon) => {
            const checked = checkedIds.has(addon.id);
            return (
              <AddonRow key={addon.id}>
                <CheckboxLabel disabled={addon.disabled}>
                  <HiddenCheckbox
                    checked={checked}
                    disabled={addon.disabled}
                    onChange={() => onAddonToggle(addon)}
                    type="checkbox"
                  />
                  <CheckboxFace checked={checked} aria-hidden="true">
                    {checked ? <CheckGlyph>✓</CheckGlyph> : null}
                  </CheckboxFace>
                  <AddonLabelText>{addon.label}</AddonLabelText>
                </CheckboxLabel>
                <AddonRightText>{addon.rightLabel}</AddonRightText>
              </AddonRow>
            );
          })}
          <FakeButton>{pricing.secondaryCtaLabel}</FakeButton>
        </Inner>
      </ContentPad>
    </Panel>
  );
}
