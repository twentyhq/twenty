'use client';

import type {
  SalesforceAddonRowType,
  SalesforcePricingPanelType,
  SalesforceRichTextPartType,
} from '@/sections/Salesforce/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

const formatPriceAmount = (amount: number) =>
  `$${new Intl.NumberFormat('en-US').format(amount)}`;

const calculatePriceAmounts = (
  pricing: SalesforcePricingPanelType,
  checkedIds: ReadonlySet<string>,
) => {
  const appliedSharedCosts = new Set<string>();

  let perSeatBaseAmount = pricing.basePriceAmount;
  let fixedPriceAmount = 0;
  let netSpendRate = 0;

  for (const addon of pricing.addons) {
    if (!checkedIds.has(addon.id)) {
      continue;
    }

    if (addon.sharedCostKey && appliedSharedCosts.has(addon.sharedCostKey)) {
      fixedPriceAmount += addon.fixedCost ?? 0;
      netSpendRate += addon.netSpendRate ?? 0;
      continue;
    }

    if (addon.sharedCostKey) {
      appliedSharedCosts.add(addon.sharedCostKey);
    }

    perSeatBaseAmount += addon.cost;
    fixedPriceAmount += addon.fixedCost ?? 0;
    netSpendRate += addon.netSpendRate ?? 0;
  }

  const perSeatPriceAmount = perSeatBaseAmount * (1 + netSpendRate);
  const totalBaseAmount = perSeatBaseAmount + fixedPriceAmount;
  const totalPriceAmount = totalBaseAmount * (1 + netSpendRate);

  return {
    fixedPriceAmount,
    perSeatPriceAmount,
    totalPriceAmount,
  };
};

const ANIMATION_DURATION_MS = 500;

const useAnimatedNumber = (target: number) => {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;

    if (from === target) {
      return;
    }

    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return display;
};

const PANEL_BACKGROUND = '#c9c9c9';
const SALESFORCE_BLUE = '#009EDB';

const PanelWrapper = styled.div`
  max-width: 672px;
  padding-top: ${theme.spacing(8)};
  position: relative;
  width: 100%;
`;

// 16-point starburst — shallow spikes to keep text readable
const STARBURST_CLIP = `polygon(
  50% 0%, 55% 18%, 65% 3%, 66% 22%,
  80% 10%, 76% 28%, 93% 22%, 83% 36%,
  100% 42%, 86% 48%, 98% 62%, 83% 62%,
  92% 78%, 78% 72%, 76% 90%, 64% 78%,
  56% 97%, 50% 80%, 38% 100%, 36% 80%,
  22% 92%, 26% 74%, 8% 80%, 18% 64%,
  0% 58%, 16% 50%, 2% 36%, 18% 34%,
  6% 18%, 22% 26%, 20% 8%, 34% 22%,
  40% 2%, 44% 20%
)`;

const PromoTagBorder = styled.div`
  clip-path: ${STARBURST_CLIP};
  background: #005fb2;
  filter: drop-shadow(2px 3px 6px rgba(0, 40, 80, 0.45));
  display: inline-flex;
  min-width: 200px;
  padding: 4px;
  position: absolute;
  right: ${theme.spacing(25)};
  top: -16px;
  transform: rotate(-8deg);
  z-index: 30;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    min-width: 168px;
    right: ${theme.spacing(8)};
    top: -8px;
  }
`;

const PromoTagInner = styled.div`
  align-items: center;
  background: ${SALESFORCE_BLUE};
  clip-path: ${STARBURST_CLIP};
  color: #ffffff;
  display: flex;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4.5)};
  font-weight: bold;
  justify-content: center;
  letter-spacing: 1px;
  line-height: 1.15;
  min-height: 104px;
  padding: ${theme.spacing(7)} ${theme.spacing(10)};
  text-align: center;
  text-transform: uppercase;
  white-space: pre-line;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    font-size: ${theme.font.size(4)};
    min-height: 88px;
    padding: ${theme.spacing(6)} ${theme.spacing(7)};
  }
`;

const Panel = styled.div`
  background-color: ${PANEL_BACKGROUND};
  display: flex;
  flex-direction: column;
  padding: 3px;
  position: relative;
  width: 100%;

  &::after {
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: 10;
  }
`;

const PricingHeader = styled.div`
  position: relative;
  width: 100%;
  z-index: 20;
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
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4)};
  line-height: 12px;
  margin: 0;
`;

const TitleBarActions = styled.div`
  display: flex;
  gap: 2px;
`;

const TitleBarActionButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  color: ${theme.colors.primary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(3.5)};
  justify-content: center;
  line-height: 1;
  min-height: 18px;
  min-width: 18px;
  padding: 2px 4px;

  &:active {
    box-shadow:
      inset 1px 1px 0 0 #0a0a0a,
      inset -1px -1px 0 0 #ffffff;
  }
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
  padding: 0 ${theme.spacing(2.75)} ${theme.spacing(2.75)};
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

const SummaryPad = styled.div`
  padding: ${theme.spacing(2.75)} ${theme.spacing(2.75)} 0;
  width: 100%;
`;

const SummaryInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  padding: ${theme.spacing(4)} ${theme.spacing(4)} 0;
  width: 100%;
`;

const ProductBlock = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${theme.font.family.retro};
  gap: ${theme.spacing(4)};
  width: 100%;
`;

const ProductHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${theme.spacing(4)};
  justify-content: space-between;
  width: 100%;
`;

const ProductCopy = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  max-width: 427px;
  min-width: 0;
`;

const ProductTitle = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(10)};
  line-height: ${theme.spacing(9.5)};
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

const BasePriceAmount = styled.span`
  color: ${theme.colors.primary.text[40]};
  font-size: ${theme.font.size(8)};
  line-height: ${theme.spacing(10)};
  text-decoration: line-through;
  text-decoration-thickness: 2px;
`;

const PriceSuffix = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
`;

const TotalPriceRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${theme.spacing(2)};
  white-space: nowrap;
  width: 100%;
`;

const TotalPriceAmount = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(8)};
  line-height: ${theme.spacing(10)};
`;

const TotalPriceLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
`;

const ProductIcon = styled.img`
  flex-shrink: 0;
  height: 92px;
  image-rendering: pixelated;
  object-fit: contain;
  width: 92px;
`;

const FakeButton = styled.a`
  align-items: center;
  background-color: ${PANEL_BACKGROUND};
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  color: ${theme.colors.primary.text[100]};
  display: flex;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4)};
  justify-content: center;
  line-height: ${theme.spacing(4)};
  min-height: ${theme.spacing(10)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(4.5)};
  position: relative;
  text-decoration: none;
  width: 100%;
  z-index: 11;
`;

const Separator = styled.div`
  border-top: 1px solid ${theme.colors.secondary.border[100]};
  width: 100%;
`;

const FooterNote = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.spacing(6)};
  margin: 0;
`;

const FooterCtaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  position: relative;
  width: 100%;
  z-index: 11;
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SectionLabel = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.spacing(6)};
  margin: 0;
`;

const AddonRow = styled.div`
  align-items: flex-start;
  border-radius: 0;
  display: grid;
  gap: ${theme.spacing(4)};
  grid-template-columns: minmax(0, 1fr) minmax(148px, 220px);
  margin: 0 -${theme.spacing(1.5)};
  padding: ${theme.spacing(1)} ${theme.spacing(1.5)};
  position: relative;
  transition: background-color 0ms;
  width: calc(100% + ${theme.spacing(3)});

  &:hover {
    background-color: #000080;

    span,
    label span {
      color: #ffffff;
    }

    label span[aria-hidden] span {
      color: ${theme.colors.primary.text[100]};
    }
  }
`;

const Tooltip = styled.div`
  background: ${PANEL_BACKGROUND};
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf,
    4px 4px 0 0 rgba(0, 0, 0, 0.15);
  display: none;
  font-family: ${theme.font.family.retro};
  left: 0;
  padding: ${theme.spacing(0.5)};
  position: absolute;
  top: 100%;
  width: 240px;
  z-index: 40;

  ${AddonRow}:hover & {
    display: block;
  }
`;

const TooltipTitleBar = styled.div`
  align-items: center;
  background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
  color: #ffffff;
  display: flex;
  font-size: ${theme.font.size(3.5)};
  line-height: 1;
  padding: 3px 4px;
`;

const TooltipBody = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(4)};
  line-height: 1.4;
  margin: 0;
  padding: ${theme.spacing(2)};
`;

const CheckboxLabel = styled.label<{ disabled?: boolean }>`
  align-items: flex-start;
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
  aspect-ratio: 1 / 1;
  background-color: ${({ checked }) =>
    checked
      ? theme.colors.primary.background[100]
      : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 0;
  box-sizing: border-box;
  box-shadow:
    inset -1.5px -1.5px 0 0 #ffffff,
    inset 1.5px 1.5px 0 0 #808080,
    inset -3px -3px 0 0 #dfdfdf,
    inset 3px 3px 0 0 #0a0a0a;
  display: block;
  flex-shrink: 0;
  height: ${theme.spacing(5.5)};
  position: relative;
  transform: ${({ checked }) => (checked ? 'scale(1.08)' : 'scale(1)')};
  transform-origin: center;
  transition:
    transform 140ms ease-out,
    background-color 140ms ease-out;
  user-select: none;
  width: ${theme.spacing(5.5)};
`;

const CheckGlyph = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(4)};
  left: 50%;
  line-height: 1;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -55%);
  user-select: none;
`;

const AddonLabelText = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  white-space: pre-line;
`;

const AddonRightText = styled.span`
  display: block;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  text-align: right;
`;

const AddonRightLine = styled.span<{ 'data-muted'?: boolean }>`
  color: ${(props) =>
    props['data-muted']
      ? theme.colors.primary.text[60]
      : theme.colors.primary.text[100]};
  display: block;
`;

const AddonRightPart = styled.span`
  color: inherit;
  font: inherit;
`;

const renderRightLabelParts = (lines: SalesforceRichTextPartType[][]) =>
  lines.map((line, lineIndex) => (
    <AddonRightLine key={lineIndex} data-muted={lineIndex > 0 || undefined}>
      {line.map((part, partIndex) => (
        <AddonRightPart
          key={partIndex}
          style={
            part.strike
              ? {
                  textDecorationLine: 'line-through',
                  textDecorationThickness: '1px',
                }
              : undefined
          }
        >
          {part.text}
        </AddonRightPart>
      ))}
    </AddonRightLine>
  ));

const renderRightLabel = (label: string) =>
  label.split('\n').map((line, lineIndex) => (
    <AddonRightLine
      key={`${lineIndex}-${line}`}
      data-muted={lineIndex > 0 || undefined}
    >
      {line}
    </AddonRightLine>
  ));

const SelectAllButton = styled.button`
  align-items: center;
  background-color: rgba(28, 28, 28, 0.2);
  border: none;
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  color: ${theme.colors.primary.text[80]};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(3.5)};
  justify-content: center;
  line-height: 1;
  padding: ${theme.spacing(1)} ${theme.spacing(3)};

  &:active {
    box-shadow:
      inset 1px 1px 0 0 #0a0a0a,
      inset -1px -1px 0 0 #ffffff;
  }
`;

export type PricingWindowProps = {
  checkedIds: ReadonlySet<string>;
  onAddonToggle: (
    addon: SalesforceAddonRowType,
    anchorRect: DOMRect | null,
  ) => void;
  onClose: () => void;
  onSelectAll: () => void;
  pricing: SalesforcePricingPanelType;
};

export function PricingWindow({
  checkedIds,
  onAddonToggle,
  onClose,
  onSelectAll,
  pricing,
}: PricingWindowProps) {
  const addonAnchorRefs = useRef<Record<string, HTMLLabelElement | null>>({});
  const { fixedPriceAmount, perSeatPriceAmount, totalPriceAmount } =
    calculatePriceAmounts(pricing, checkedIds);

  const animatedPerSeat = useAnimatedNumber(perSeatPriceAmount);
  const animatedTotal = useAnimatedNumber(totalPriceAmount);

  return (
    <PanelWrapper>
      {pricing.promoTag ? (
        <PromoTagBorder>
          <PromoTagInner>{pricing.promoTag}</PromoTagInner>
        </PromoTagBorder>
      ) : null}
      <Panel>
        <WindowChrome aria-hidden="true" />
        <PricingHeader>
          <TitleBar>
            <TitleBarText>{pricing.windowTitle}</TitleBarText>
            <TitleBarActions>
              <TitleBarActionButton
                aria-label="Help"
                onClick={() => undefined}
                type="button"
              >
                ?
              </TitleBarActionButton>
              <TitleBarActionButton
                aria-label="Close pricing window"
                onClick={onClose}
                type="button"
              >
                ×
              </TitleBarActionButton>
            </TitleBarActions>
          </TitleBar>
          <SummaryPad>
            <SummaryInner>
              <ProductBlock>
                <ProductHeader>
                  <ProductCopy>
                    <ProductTitle>{pricing.productTitle}</ProductTitle>
                    <PriceRow>
                      {perSeatPriceAmount > pricing.basePriceAmount ? (
                        <BasePriceAmount>
                          {formatPriceAmount(pricing.basePriceAmount)}
                        </BasePriceAmount>
                      ) : null}
                      <PriceAmount>
                        {formatPriceAmount(animatedPerSeat)}
                      </PriceAmount>
                      <PriceSuffix>{pricing.priceSuffix}</PriceSuffix>
                    </PriceRow>
                    {fixedPriceAmount > 0 ? (
                      <TotalPriceRow>
                        <TotalPriceAmount>
                          {formatPriceAmount(animatedTotal)}
                        </TotalPriceAmount>
                        <TotalPriceLabel>
                          {pricing.totalPriceLabel}
                        </TotalPriceLabel>
                      </TotalPriceRow>
                    ) : null}
                  </ProductCopy>
                  <ProductIcon
                    alt={pricing.productIconAlt}
                    src={pricing.productIconSrc}
                  />
                </ProductHeader>
              </ProductBlock>
              <Separator aria-hidden="true" />
            </SummaryInner>
          </SummaryPad>
        </PricingHeader>
        <ContentPad>
          <Inner>
            <SectionHeader>
              <SectionLabel>{pricing.featureSectionHeading}</SectionLabel>
              <SelectAllButton onClick={onSelectAll} type="button">
                Select all
              </SelectAllButton>
            </SectionHeader>
            {pricing.addons.map((addon) => {
              const checked = checkedIds.has(addon.id);
              return (
                <AddonRow key={addon.id}>
                  <CheckboxLabel
                    disabled={addon.disabled}
                    ref={(node) => {
                      addonAnchorRefs.current[addon.id] = node;
                    }}
                  >
                    <HiddenCheckbox
                      checked={checked}
                      disabled={addon.disabled}
                      onChange={() =>
                        onAddonToggle(
                          addon,
                          addonAnchorRefs.current[
                            addon.id
                          ]?.getBoundingClientRect() ?? null,
                        )
                      }
                      type="checkbox"
                    />
                    <CheckboxFace checked={checked} aria-hidden="true">
                      {checked ? <CheckGlyph>✓</CheckGlyph> : null}
                    </CheckboxFace>
                    <AddonLabelText>{addon.label}</AddonLabelText>
                  </CheckboxLabel>
                  <AddonRightText>
                    {addon.rightLabelParts
                      ? renderRightLabelParts(addon.rightLabelParts)
                      : renderRightLabel(addon.rightLabel)}
                  </AddonRightText>
                  {addon.tooltip ? (
                    <Tooltip>
                      <TooltipTitleBar>{addon.tooltip.title}</TooltipTitleBar>
                      <TooltipBody>{addon.tooltip.body}</TooltipBody>
                    </Tooltip>
                  ) : null}
                </AddonRow>
              );
            })}
            <FooterCtaSection>
              <Separator aria-hidden="true" />
              {pricing.secondaryCtaNote ? (
                <FooterNote>{pricing.secondaryCtaNote}</FooterNote>
              ) : null}
              <FakeButton
                href={pricing.secondaryCtaHref}
                rel="noreferrer"
                target="_blank"
              >
                {pricing.secondaryCtaLabel}
              </FakeButton>
            </FooterCtaSection>
          </Inner>
        </ContentPad>
      </Panel>
    </PanelWrapper>
  );
}
