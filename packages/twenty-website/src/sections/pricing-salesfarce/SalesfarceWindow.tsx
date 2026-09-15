'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useRef } from 'react';

import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { useAnimatedNumber } from '@/platform/motion';
import { color, fontFamily, fontSize, mediaUp, spacing } from '@/tokens';
import { SALESFARCE_SCENE } from '@/tokens/feature-scenes/salesfarce-scene';
import { ExternalLink } from '@/ui';

import { calculatePriceAmounts } from './calculate-price-amounts';
import {
  type SalesfarceAddonRowType,
  type SalesfarcePricingPanelType,
  type SalesfarceRichTextPartType,
} from './salesfarce-types';

const formatPriceAmount = (amount: number) =>
  `$${new Intl.NumberFormat('en-US').format(amount)}`;

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

const PanelWrapper = styled.div`
  max-width: 672px;
  padding-top: ${spacing(8)};
  position: relative;
  width: 100%;
`;

const PromoTagBorder = styled.div`
  background: ${SALESFARCE_SCENE.starburstBorder};
  clip-path: ${STARBURST_CLIP};
  display: inline-flex;
  filter: drop-shadow(2px 3px 6px ${SALESFARCE_SCENE.starburstShadow});
  min-width: 168px;
  padding: 4px;
  position: absolute;
  right: ${spacing(8)};
  top: -8px;
  transform: rotate(-8deg);
  z-index: 30;

  ${mediaUp('md')} {
    min-width: 200px;
    right: ${spacing(25)};
    top: -16px;
  }
`;

const PromoTagInner = styled.div`
  align-items: center;
  background: ${SALESFARCE_SCENE.starburstFill};
  clip-path: ${STARBURST_CLIP};
  color: ${color('white')};
  display: flex;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4)};
  font-weight: bold;
  justify-content: center;
  letter-spacing: 1px;
  line-height: 1.15;
  min-height: 88px;
  padding: ${spacing(6)} ${spacing(7)};
  text-align: center;
  text-transform: uppercase;
  white-space: pre-line;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.5)};
    min-height: 104px;
    padding: ${spacing(7)} ${spacing(10)};
  }
`;

const Panel = styled.div`
  background-color: ${SALESFARCE_SCENE.panelBackground};
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
      ${SALESFARCE_SCENE.scanline} 2px,
      ${SALESFARCE_SCENE.scanline} 4px
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
  background: ${SALESFARCE_SCENE.titleBarGradient};
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 3px 3px;
  width: 100%;
`;

const TitleBarText = styled.p`
  color: ${color('white')};
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4)};
  line-height: 12px;
`;

const TitleBarActions = styled.div`
  column-gap: 2px;
  display: flex;
`;

const TitleBarActionButton = styled.button`
  align-items: center;
  background: ${SALESFARCE_SCENE.actionButtonBackground};
  border: none;
  box-shadow: ${SALESFARCE_SCENE.bevel.raised};
  color: ${color('black')};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(3.5)};
  justify-content: center;
  line-height: 1;
  min-height: 18px;
  min-width: 18px;
  padding: 2px 4px;

  &:active {
    box-shadow: ${SALESFARCE_SCENE.bevel.pressed};
  }
`;

const WindowChrome = styled.div`
  box-shadow: ${SALESFARCE_SCENE.bevel.window};
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

const ContentPad = styled.div`
  padding: 0 ${spacing(2.75)} ${spacing(2.75)};
  width: 100%;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  overflow: clip;
  padding: ${spacing(4)};
  width: 100%;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const SummaryPad = styled.div`
  padding: ${spacing(2.75)} ${spacing(2.75)} 0;
  width: 100%;
`;

const SummaryInner = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${spacing(4)} ${spacing(4)} 0;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const ProductBlock = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${fontFamily('retro')};
  width: 100%;
`;

const ProductHeader = styled.div`
  align-items: flex-start;
  column-gap: ${spacing(4)};
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ProductCopy = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-width: 427px;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const ProductTitle = styled.p`
  color: ${color('black')};
  font-size: ${fontSize(10)};
  line-height: ${spacing(9.5)};
`;

const PriceRow = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1)};
  white-space: nowrap;
`;

const PriceAmount = styled.span`
  color: ${color('black')};
  font-size: ${fontSize(12.75)};
  line-height: ${spacing(10)};
`;

const BasePriceAmount = styled.span`
  color: ${color('black-40')};
  font-size: ${fontSize(8)};
  line-height: ${spacing(10)};
  text-decoration: line-through;
  text-decoration-thickness: 2px;
`;

const PriceSuffix = styled.span`
  color: ${color('black-60')};
  font-size: ${fontSize(4.5)};
  line-height: ${spacing(5.5)};
`;

const TotalPriceRow = styled.div`
  align-items: baseline;
  column-gap: ${spacing(2)};
  display: flex;
  white-space: nowrap;
  width: 100%;
`;

const TotalPriceAmount = styled.span`
  color: ${color('black')};
  font-size: ${fontSize(8)};
  line-height: ${spacing(10)};
`;

const TotalPriceLabel = styled.span`
  color: ${color('black-60')};
  font-size: ${fontSize(4.5)};
  line-height: ${spacing(5.5)};
`;

const ProductIcon = styled.img`
  flex-shrink: 0;
  height: 92px;
  image-rendering: pixelated;
  object-fit: contain;
  width: 92px;
`;

const FakeButton = styled(ExternalLink)`
  align-items: center;
  background-color: ${SALESFARCE_SCENE.panelBackground};
  box-shadow: ${SALESFARCE_SCENE.bevel.raised};
  color: ${color('black')};
  display: flex;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4)};
  justify-content: center;
  line-height: ${spacing(4)};
  min-height: ${spacing(10)};
  padding: ${spacing(1.5)} ${spacing(4.5)};
  position: relative;
  text-decoration: none;
  width: 100%;
  z-index: 11;
`;

const Separator = styled.div`
  border-top: 1px solid ${color('white')};
  width: 100%;
`;

const FooterNote = styled.p`
  color: ${color('black-60')};
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(5)};
  line-height: ${spacing(6)};
`;

const FooterCtaSection = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  z-index: 11;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SectionLabel = styled.p`
  color: ${color('black-80')};
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(5)};
  line-height: ${spacing(6)};
`;

const AddonRow = styled.div`
  align-items: flex-start;
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(148px, 220px);
  margin-left: -${spacing(1.5)};
  margin-right: -${spacing(1.5)};
  padding: ${spacing(1)} ${spacing(1.5)};
  position: relative;
  transition: background-color 0ms;
  width: calc(100% + ${spacing(3)});

  &:hover {
    background-color: ${SALESFARCE_SCENE.hover};

    span,
    label span {
      color: ${color('white')};
    }

    label span[aria-hidden] span {
      color: ${color('black')};
    }
  }
`;

const Tooltip = styled.div`
  background: ${SALESFARCE_SCENE.panelBackground};
  box-shadow: ${SALESFARCE_SCENE.tooltipShadow};
  display: none;
  font-family: ${fontFamily('retro')};
  left: 0;
  padding: ${spacing(0.5)};
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
  background: ${SALESFARCE_SCENE.titleBarGradient};
  color: ${color('white')};
  display: flex;
  font-size: ${fontSize(3.5)};
  line-height: 1;
  padding: 3px 4px;
`;

const TooltipBody = styled.p`
  color: ${color('black')};
  font-size: ${fontSize(4)};
  line-height: 1.4;
  padding: ${spacing(2)};
`;

const CheckboxLabel = styled.label`
  align-items: flex-start;
  column-gap: ${spacing(2)};
  cursor: pointer;
  display: flex;
  flex: 1;
  min-width: 0;
  opacity: 1;

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const HiddenCheckbox = styled.input`
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
`;

const CheckboxFace = styled.span`
  aspect-ratio: 1 / 1;
  background-color: ${SALESFARCE_SCENE.checkboxUncheckedBackground};
  box-shadow: ${SALESFARCE_SCENE.bevel.sunken};
  box-sizing: border-box;
  display: block;
  flex-shrink: 0;
  height: ${spacing(5.5)};
  position: relative;
  transform: scale(1);
  transform-origin: center;
  transition:
    transform 140ms ease-out,
    background-color 140ms ease-out;
  user-select: none;
  width: ${spacing(5.5)};

  &[data-checked] {
    background-color: ${color('white')};
    transform: scale(1.08);
  }
`;

const CheckGlyph = styled.span`
  color: ${color('black')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(4)};
  left: 50%;
  line-height: 1;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -55%);
  user-select: none;
`;

const AddonLabelText = styled.span`
  color: ${color('black-60')};
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4.5)};
  line-height: ${spacing(5.5)};
  white-space: pre-line;
`;

const AddonRightText = styled.span`
  display: block;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4.5)};
  line-height: ${spacing(5.5)};
  text-align: right;
  white-space: pre-line;
`;

const AddonRightLine = styled.span`
  color: ${color('black')};
  display: block;

  &[data-muted] {
    color: ${color('black-60')};
  }
`;

const AddonRightPart = styled.span`
  color: inherit;
  font: inherit;
`;

const SelectAllButton = styled.button`
  align-items: center;
  background-color: ${SALESFARCE_SCENE.selectAllBackground};
  border: none;
  box-shadow: ${SALESFARCE_SCENE.bevel.raised};
  color: ${color('black-80')};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(3.5)};
  justify-content: center;
  line-height: 1;
  padding: ${spacing(1)} ${spacing(3)};

  &:active {
    box-shadow: ${SALESFARCE_SCENE.bevel.pressed};
  }
`;

const renderRightLabelParts = (
  lines: SalesfarceRichTextPartType[][],
  translate: (descriptor: MessageDescriptor) => string,
) =>
  lines.map((line, lineIndex) => (
    <AddonRightLine
      key={line.map((part) => getMessageDescriptorSource(part.text)).join('|')}
      data-muted={lineIndex > 0 || undefined}
    >
      {line.map((part, partIndex) => (
        <AddonRightPart
          key={getMessageDescriptorSource(part.text)}
          style={
            part.strike
              ? {
                  textDecorationLine: 'line-through',
                  textDecorationThickness: '1px',
                }
              : undefined
          }
        >
          {partIndex > 0 ? ' ' : null}
          {translate(part.text)}
        </AddonRightPart>
      ))}
    </AddonRightLine>
  ));

const renderRightLabel = (
  label: MessageDescriptor,
  translate: (descriptor: MessageDescriptor) => string,
) => <AddonRightLine>{translate(label)}</AddonRightLine>;

type SalesfarceWindowProps = {
  checkedIds: ReadonlySet<string>;
  onAddonToggle: (
    addon: SalesfarceAddonRowType,
    anchorRect: DOMRect | null,
  ) => void;
  onClose: () => void;
  onSelectAll: () => void;
  pricing: SalesfarcePricingPanelType;
};

export function SalesfarceWindow({
  checkedIds,
  onAddonToggle,
  onClose,
  onSelectAll,
  pricing,
}: SalesfarceWindowProps) {
  const { i18n } = useLingui();
  const addonAnchorRefs = useRef<Record<string, HTMLLabelElement | null>>({});
  const { fixedPriceAmount, perSeatPriceAmount, totalPriceAmount } =
    calculatePriceAmounts(pricing.addons, pricing.basePriceAmount, checkedIds);

  const animatedPerSeat = useAnimatedNumber(perSeatPriceAmount);
  const animatedTotal = useAnimatedNumber(totalPriceAmount);

  return (
    <PanelWrapper>
      {pricing.promoTag ? (
        <PromoTagBorder>
          <PromoTagInner>{i18n._(pricing.promoTag)}</PromoTagInner>
        </PromoTagBorder>
      ) : null}
      <Panel>
        <WindowChrome aria-hidden="true" />
        <PricingHeader>
          <TitleBar>
            <TitleBarText>{i18n._(pricing.windowTitle)}</TitleBarText>
            <TitleBarActions>
              <TitleBarActionButton
                aria-label={i18n._(msg`Help`)}
                onClick={() => undefined}
                type="button"
              >
                ?
              </TitleBarActionButton>
              <TitleBarActionButton
                aria-label={i18n._(msg`Close pricing window`)}
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
                    <ProductTitle>{i18n._(pricing.productTitle)}</ProductTitle>
                    <PriceRow>
                      {perSeatPriceAmount > pricing.basePriceAmount ? (
                        <BasePriceAmount>
                          {formatPriceAmount(pricing.basePriceAmount)}
                        </BasePriceAmount>
                      ) : null}
                      <PriceAmount>
                        {formatPriceAmount(animatedPerSeat)}
                      </PriceAmount>
                      <PriceSuffix> {i18n._(pricing.priceSuffix)}</PriceSuffix>
                    </PriceRow>
                    {fixedPriceAmount > 0 ? (
                      <TotalPriceRow>
                        <TotalPriceAmount>
                          {formatPriceAmount(animatedTotal)}
                        </TotalPriceAmount>
                        <TotalPriceLabel>
                          {i18n._(pricing.totalPriceLabel)}
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
              <SectionLabel>
                {i18n._(pricing.featureSectionHeading)}
              </SectionLabel>
              <SelectAllButton onClick={onSelectAll} type="button">
                <Trans>Select all</Trans>
              </SelectAllButton>
            </SectionHeader>
            {pricing.addons.map((addon) => {
              const checked = checkedIds.has(addon.id);
              return (
                <AddonRow key={addon.id}>
                  <CheckboxLabel
                    data-disabled={addon.disabled || undefined}
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
                    <CheckboxFace
                      data-checked={checked || undefined}
                      aria-hidden="true"
                    >
                      {checked ? <CheckGlyph>✓</CheckGlyph> : null}
                    </CheckboxFace>
                    <AddonLabelText>{i18n._(addon.label)}</AddonLabelText>
                  </CheckboxLabel>
                  <AddonRightText>
                    {addon.rightLabelParts
                      ? renderRightLabelParts(addon.rightLabelParts, (d) =>
                          i18n._(d),
                        )
                      : renderRightLabel(addon.rightLabel, (d) => i18n._(d))}
                  </AddonRightText>
                  {addon.tooltip ? (
                    <Tooltip>
                      <TooltipTitleBar>
                        {i18n._(addon.tooltip.title)}
                      </TooltipTitleBar>
                      <TooltipBody>{i18n._(addon.tooltip.body)}</TooltipBody>
                    </Tooltip>
                  ) : null}
                </AddonRow>
              );
            })}
            <FooterCtaSection>
              <Separator aria-hidden="true" />
              {pricing.secondaryCtaNote ? (
                <FooterNote>{i18n._(pricing.secondaryCtaNote)}</FooterNote>
              ) : null}
              <FakeButton href={pricing.secondaryCtaHref}>
                {i18n._(pricing.secondaryCtaLabel)}
              </FakeButton>
            </FooterCtaSection>
          </Inner>
        </ContentPad>
      </Panel>
    </PanelWrapper>
  );
}
